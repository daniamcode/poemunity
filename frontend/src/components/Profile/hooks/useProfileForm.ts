import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAppDispatch } from '../../../redux/store'
import { getPoemAction, savePoemAction } from '../../../redux/actions/poemActions'
import {
    createPoemAction,
    insertPoemIntoCaches,
    movePoemBetweenDraftAndPublished,
    setRanking
} from '../../../redux/actions/poemsActions'
import { poemUpdated } from '../../../redux/reducers/poemEntitiesReducers'
import { getUserStatsAction } from '../../../redux/actions/statsActions'
import { manageError, manageSuccess } from '../../../utils/notifications'
import { buildPoemData } from '../../../utils/poemUtils'
import { PoemStatus } from '../../../typescript/interfaces'

export interface PoemFormData {
    content: string
    fakeId: string
    title: string
    origin: string
    category: string
    likes: string | string[]
}

export interface UseProfileFormReturn {
    poem: PoemFormData
    isEditing: boolean
    updatePoemField: <K extends keyof PoemFormData>(field: K, value: PoemFormData[K]) => void
    handleSend: (event: React.MouseEvent<HTMLButtonElement>) => void
    handleSaveDraft: (event: React.MouseEvent<HTMLButtonElement>) => void
    handleReset: (event: React.MouseEvent<HTMLButtonElement>) => void
    handleCancel: (event: React.MouseEvent<HTMLButtonElement>) => void
}

const initialPoemState: PoemFormData = {
    content: '',
    fakeId: '',
    title: '',
    origin: '',
    category: '',
    likes: []
}

export function useProfileForm(context: any, poemQuery: any, poemsListQuery: any): UseProfileFormReturn {
    const dispatch = useAppDispatch()
    const router = useRouter()
    const isAdmin = context?.isAdmin ?? false

    // Get elementToEdit from URL query params (e.g., /profile?edit=poemId)
    const elementToEdit = (router.query.edit as string) || ''
    const isEditing = Boolean(elementToEdit)

    // Navigation state is not available in Next.js — edit param drives all loading
    const initializedFromCache = React.useRef(false)

    // Track previous elementToEdit to detect when user switches between poems
    const prevElementToEdit = React.useRef(elementToEdit)

    // Initialize poem state - use lazy initialization to avoid flicker
    // TODO: This seems crazy, simplify or go for another approach
    const [poem, setPoem] = useState<PoemFormData>(() => {
        // If editing, try to get poem data from cache to avoid flicker
        if (isEditing) {
            // First priority: poemQuery (most specific cache)
            if (poemQuery?.item && poemQuery.item.id === elementToEdit) {
                return {
                    title: poemQuery.item.title || '',
                    content: poemQuery.item.poem || '',
                    fakeId: poemQuery.item.userId || '',
                    likes: poemQuery.item.likes?.toString() || [],
                    category: poemQuery.item.genre || '',
                    origin: poemQuery.item.origin || ''
                }
            }

            // Fallback to poemsList cache (likely when editing from list)
            // poemsListQuery.item is directly an array of poems
            if (Array.isArray(poemsListQuery?.item)) {
                const cachedPoem = poemsListQuery.item.find((p: any) => p.id === elementToEdit)
                if (cachedPoem) {
                    initializedFromCache.current = true
                    return {
                        title: cachedPoem.title || '',
                        content: cachedPoem.poem || '',
                        fakeId: cachedPoem.userId || '',
                        likes: cachedPoem.likes?.toString() || [],
                        category: cachedPoem.genre || '',
                        origin: cachedPoem.origin || ''
                    }
                }
            }
        }

        return initialPoemState
    })

    // Initialize poem query on mount (only reset when creating, not editing)
    useEffect(() => {
        if (!elementToEdit) {
            dispatch(getPoemAction({ options: { reset: true, fetch: false } }))
        }
    }, [dispatch, elementToEdit])

    // Load poem for editing (only if not already in cache)
    useEffect(() => {
        if (isEditing) {
            // Check if we already have this poem in cache (either in poemQuery or poemsList)
            const alreadyInPoemQuery = poemQuery?.item?.id === elementToEdit
            const alreadyInPoemsList =
                Array.isArray(poemsListQuery?.item) && poemsListQuery.item.some((p: any) => p.id === elementToEdit)

            // If we initialized from cache, never fetch
            if (initializedFromCache.current && alreadyInPoemsList) {
                return
            }

            if (!alreadyInPoemQuery && !alreadyInPoemsList) {
                dispatch(
                    getPoemAction({
                        params: { poemId: elementToEdit },
                        options: { reset: false, fetch: true }
                    })
                )
            }
        }
    }, [dispatch, isEditing, elementToEdit, poemQuery?.item?.id, poemsListQuery?.item])

    // Detect when user switches from one poem to another and reset form
    useEffect(() => {
        // Only reset if actually switching between two different poems (not from undefined to poem or vice versa)
        if (
            elementToEdit &&
            prevElementToEdit.current &&
            prevElementToEdit.current !== elementToEdit &&
            prevElementToEdit.current !== '' // Don't reset if coming from empty state
        ) {
            // User switched from editing one poem to another
            // Reset the form and clear cache flag so new poem data loads
            setPoem(initialPoemState)
            initializedFromCache.current = false
        }
        // Always update the ref to track current state
        if (elementToEdit) {
            prevElementToEdit.current = elementToEdit
        }
    }, [elementToEdit])

    // Populate form when editing - only update from poemQuery if form is still empty
    useEffect(() => {
        if (isEditing && poemQuery?.item && poemQuery.item.id === elementToEdit) {
            // Only update if the form is empty (hasn't been initialized yet)
            if (!poem.title || poem.title === '') {
                setPoem({
                    title: poemQuery.item.title || '',
                    content: poemQuery.item.poem || '',
                    fakeId: poemQuery.item.userId || '',
                    likes: poemQuery.item.likes?.toString() || [],
                    category: poemQuery.item.genre || '',
                    origin: poemQuery.item.origin || ''
                })
            }
        } else if (!isEditing && prevElementToEdit.current && prevElementToEdit.current !== '') {
            // Only reset if transitioning from editing to not editing (intentional clear)
            // This prevents flickering but allows proper reset after save/cancel
            setPoem(initialPoemState)
            prevElementToEdit.current = '' // Update ref to prevent repeated resets
        }
    }, [isEditing, poemQuery?.item, elementToEdit, poem.title])

    function updatePoemField<K extends keyof PoemFormData>(field: K, value: PoemFormData[K]) {
        setPoem(prev => ({ ...prev, [field]: value }))
    }

    function handleCreatePoem(poemData: any) {
        dispatch(
            createPoemAction({
                poem: poemData,
                context,
                callbacks: {
                    success: response => {
                        // The create response is the new poem with a `ranking` sibling
                        // (freshly recomputed server-side). Split them: the poem goes
                        // into the entity/list caches, the ranking into its own cache.
                        // Stripping `ranking` keeps it off the poem entity.
                        const { ranking, ...created } = response || {}
                        // Register the new poem entity and insert its id into the
                        // relevant list caches (single source of truth).
                        dispatch(insertPoemIntoCaches({ response: created }))
                        // Adopt the server's authoritative ranking (author gained this
                        // poem's points) — no client-side scoring.
                        dispatch(setRanking(ranking))
                        // The stats panel is on this very page and counted the
                        // poem you just published. Without this it keeps its
                        // mount-time numbers until a reload — which is exactly
                        // how it shipped, and was reported straight away.
                        dispatch(getUserStatsAction())
                        manageSuccess('Poem created successfully')
                    },
                    error: () => {
                        manageError('Sorry. There was an error creating the poem')
                    }
                }
            })
        )
        setPoem(initialPoemState)
    }

    function handleSavePoem(poemData: any) {
        dispatch(
            savePoemAction({
                params: { poemId: elementToEdit },
                context,
                data: poemData,
                callbacks: {
                    success: (response: any) => {
                        // Merge the edited fields into the ONE poem entity; every
                        // view re-reads it, so no per-cache patching is needed.
                        dispatch(poemUpdated({ id: elementToEdit, changes: poemData }))
                        // An edit that also withdraws the poem is the one case
                        // where membership changes: it leaves the public lists
                        // for Drafts, and the author's points move with it.
                        if (poemData.status) {
                            dispatch(
                                movePoemBetweenDraftAndPublished({
                                    poemId: elementToEdit,
                                    status: poemData.status
                                })
                            )
                            dispatch(setRanking(response?.ranking))
                            // Same rule as the other two: an edit that also
                            // withdraws or publishes moves the poem in or out of
                            // the counted set. An ordinary edit changes neither
                            // the ranking nor the stats, which is why both live
                            // inside this `if`.
                            dispatch(getUserStatsAction())
                        }
                        manageSuccess('Poem saved')
                        // Clear edit state by navigating to profile without query params
                        router.push('/profile')
                        setPoem(initialPoemState)
                    },
                    error: () => {
                        manageError('Sorry. There was an error saving the poem')
                    }
                }
            })
        )
    }

    // `status` is only ever sent when the poet explicitly asked for a draft.
    // Omitting it on an edit is what makes editing status-preserving: the PATCH
    // route leaves a field it was not given alone, so revising a draft keeps it
    // a draft and revising a published poem keeps it published.
    function submit(status?: PoemStatus) {
        const poemData = { ...buildPoemData(poem, isAdmin), ...(status ? { status } : {}) }

        if (isEditing) {
            handleSavePoem(poemData)
        } else {
            handleCreatePoem(poemData)
        }
    }

    function handleSend(event: React.MouseEvent<HTMLButtonElement>) {
        event.preventDefault()
        submit()
    }

    function handleSaveDraft(event: React.MouseEvent<HTMLButtonElement>) {
        event.preventDefault()
        submit('draft')
    }

    function handleReset(event: React.MouseEvent<HTMLButtonElement>) {
        event.preventDefault()
        // Only clear form fields, stay in edit mode
        setPoem(initialPoemState)
    }

    function handleCancel(event: React.MouseEvent<HTMLButtonElement>) {
        event.preventDefault()
        // Exit edit mode by navigating to profile without query params
        router.push('/profile')
        setPoem(initialPoemState)
    }

    return {
        poem,
        isEditing,
        updatePoemField,
        handleSend,
        handleSaveDraft,
        handleReset,
        handleCancel
    }
}
