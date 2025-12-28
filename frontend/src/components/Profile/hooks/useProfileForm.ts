import React, { useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { useAppDispatch } from '../../../redux/store'
import { getPoemAction, savePoemAction } from '../../../redux/actions/poemActions'
import {
    createPoemAction,
    updateAllPoemsCacheAfterCreatePoemAction,
    updateMyPoemsCacheAfterCreatePoemAction,
    updatePoemsListCacheAfterCreatePoemAction,
    updateAllPoemsCacheAfterSavePoemAction,
    updateMyPoemsCacheAfterSavePoemAction,
    updatePoemsListCacheAfterSavePoemAction
} from '../../../redux/actions/poemsActions'
import { manageError, manageSuccess } from '../../../utils/notifications'
import { buildPoemData } from '../../../utils/poemUtils'

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

export function useProfileForm(context: any, poemQuery: any, poemsListQuery: any, location: any): UseProfileFormReturn {
    const dispatch = useAppDispatch()
    const history = useHistory()
    const isAdmin = context?.userId === context?.adminId

    // Get elementToEdit from URL query params (e.g., /profile?edit=poemId)
    const searchParams = new URLSearchParams(location.search)
    const elementToEdit = searchParams.get('edit') || ''
    const isEditing = Boolean(elementToEdit)

    // Get poem data from location state (passed during navigation for immediate loading)
    const locationState = location.state

    // Track if we initialized from cache to avoid unnecessary fetches
    const initializedFromCache = React.useRef(false)

    // Track previous elementToEdit to detect when user switches between poems
    const prevElementToEdit = React.useRef(elementToEdit)

    // Initialize poem state - use lazy initialization to avoid flicker
    // TODO: This seems crazy, simplify or go for another approach
    const [poem, setPoem] = useState<PoemFormData>(() => {
        // If editing, try to get poem data from cache to avoid flicker
        if (isEditing) {
            // HIGHEST PRIORITY: location state (passed during navigation)
            if (locationState?.poemData) {
                initializedFromCache.current = true
                return {
                    title: locationState.poemData.title || '',
                    content: locationState.poemData.poem || '',
                    fakeId: locationState.poemData.userId || '',
                    likes: locationState.poemData.likes?.toString() || [],
                    category: locationState.poemData.genre || '',
                    origin: locationState.poemData.origin || ''
                }
            }

            // Second priority: poemQuery (most specific cache)
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
            if (initializedFromCache.current && (alreadyInPoemsList || locationState?.poemData)) {
                return
            }

            if (!alreadyInPoemQuery && !alreadyInPoemsList && !locationState?.poemData) {
                dispatch(
                    getPoemAction({
                        params: { poemId: elementToEdit },
                        options: { reset: false, fetch: true }
                    })
                )
            }
        }
    }, [dispatch, isEditing, elementToEdit, poemQuery?.item?.id, poemsListQuery?.item, locationState?.poemData])

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
                        // Update all relevant caches after creating
                        dispatch(updateAllPoemsCacheAfterCreatePoemAction({ response }))
                        dispatch(updateMyPoemsCacheAfterCreatePoemAction({ response }))
                        dispatch(updatePoemsListCacheAfterCreatePoemAction({ response }))
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
                    success: () => {
                        const updatePayload = { poem: poemData, poemId: elementToEdit }
                        // Update all relevant caches after saving
                        dispatch(updateAllPoemsCacheAfterSavePoemAction(updatePayload))
                        dispatch(updateMyPoemsCacheAfterSavePoemAction(updatePayload))
                        dispatch(updatePoemsListCacheAfterSavePoemAction(updatePayload))
                        manageSuccess('Poem saved')
                        // Clear edit state by navigating to profile without query params
                        history.push('/profile')
                        setPoem(initialPoemState)
                    },
                    error: () => {
                        manageError('Sorry. There was an error saving the poem')
                    }
                }
            })
        )
    }

    function handleSend(event: React.MouseEvent<HTMLButtonElement>) {
        event.preventDefault()

        const poemData = buildPoemData(poem, isAdmin)

        if (isEditing) {
            handleSavePoem(poemData)
        } else {
            handleCreatePoem(poemData)
        }
    }

    function handleReset(event: React.MouseEvent<HTMLButtonElement>) {
        event.preventDefault()
        // Only clear form fields, stay in edit mode
        setPoem(initialPoemState)
    }

    function handleCancel(event: React.MouseEvent<HTMLButtonElement>) {
        event.preventDefault()
        // Exit edit mode by navigating to profile without query params
        history.push('/profile')
        setPoem(initialPoemState)
    }

    return {
        poem,
        isEditing,
        updatePoemField,
        handleSend,
        handleReset,
        handleCancel
    }
}
