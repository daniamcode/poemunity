import React, { useState, useEffect } from 'react'
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
    updatePoemField: <K extends keyof PoemFormData>(field: K, value: PoemFormData[K]) => void
    handleSend: (event: React.MouseEvent<HTMLButtonElement>) => void
    handleReset: (event: React.MouseEvent<HTMLButtonElement>) => void
}

const initialPoemState: PoemFormData = {
    content: '',
    fakeId: '',
    title: '',
    origin: '',
    category: '',
    likes: []
}

export function useProfileForm(context: any, poemQuery: any, poemsListQuery: any, locationState?: any): UseProfileFormReturn {
    const dispatch = useAppDispatch()
    const isAdmin = context?.userId === context?.adminId

    // Get elementToEdit from location state if available (from navigation), otherwise from context
    // Location state takes priority because it's set synchronously during navigation
    const elementToEdit = locationState?.elementToEdit || context?.elementToEdit
    const isEditing = Boolean(elementToEdit)

    // Track if we initialized from cache to avoid unnecessary fetches
    const initializedFromCache = React.useRef(false)

    // Initialize poem state - use lazy initialization to avoid flicker
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

    // Sync elementToEdit from location state to context if needed
    useEffect(() => {
        if (locationState?.elementToEdit && locationState.elementToEdit !== context?.elementToEdit) {
            context.setState({ elementToEdit: locationState.elementToEdit })
        }
    }, [locationState?.elementToEdit, context])

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
            const alreadyInPoemsList = Array.isArray(poemsListQuery?.item) &&
                poemsListQuery.item.some((p: any) => p.id === elementToEdit)

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

    // Populate form when editing or reset when not editing
    // Only update if poemQuery has newer/different data than what we already have
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
        } else if (!isEditing) {
            setPoem(initialPoemState)
        }
    }, [isEditing, poemQuery?.item, elementToEdit])

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
                        console.log('Poem created successfully:', response)
                        // Update all relevant caches after creating
                        dispatch(updateAllPoemsCacheAfterCreatePoemAction({ response }))
                        dispatch(updateMyPoemsCacheAfterCreatePoemAction({ response }))
                        dispatch(updatePoemsListCacheAfterCreatePoemAction({ response }))
                        manageSuccess('Poem created successfully')
                    },
                    error: error => {
                        console.error('Error creating poem:', error)
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
                params: { poemId: poemQuery.item.id },
                context,
                data: poemData,
                callbacks: {
                    success: () => {
                        console.log('Poem saved successfully:', poemQuery.item.id)
                        const updatePayload = { poem: poemData, poemId: poemQuery.item.id }
                        // Update all relevant caches after saving
                        dispatch(updateAllPoemsCacheAfterSavePoemAction(updatePayload))
                        dispatch(updateMyPoemsCacheAfterSavePoemAction(updatePayload))
                        dispatch(updatePoemsListCacheAfterSavePoemAction(updatePayload))
                        manageSuccess('Poem saved')
                    },
                    error: error => {
                        console.error('Error saving poem:', error)
                        manageError('Sorry. There was an error saving the poem')
                    }
                }
            })
        )
        context.setState({ elementToEdit: '' })
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
        context.setState({ elementToEdit: '' })
        setPoem(initialPoemState)
    }

    return {
        poem,
        updatePoemField,
        handleSend,
        handleReset
    }
}
