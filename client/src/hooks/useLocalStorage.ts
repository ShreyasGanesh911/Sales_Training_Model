import { useState, useEffect } from 'react'

interface Message {
    role: "system" | "user" | "assistant";
    content: string;
}

function useLocalStorage(key: string, initialValue: Message[] = []) {
    // State to store our value
    // Pass initial state function to useState so logic is only executed once
    const [storedValue, setStoredValue] = useState<Message[]>(() => {
        try {
            const item = window.localStorage.getItem(key)
            if (item) {
                const parsedItems = JSON.parse(item)
                return parsedItems
            }
            return initialValue
        } catch (error) {
            console.error('Error reading from localStorage:', error)
            return initialValue
        }
    })

    // Return a wrapped version of useState's setter function that persists the new value to localStorage
    const setValue = (value: Message[] | ((val: Message[]) => Message[])) => {
        try {
            // Allow value to be a function so we have same API as useState
            const valueToStore = value instanceof Function ? value(storedValue) : value
            setStoredValue(valueToStore)
            window.localStorage.setItem(key, JSON.stringify(valueToStore))
        } catch (error) {
            console.error('Error writing to localStorage:', error)
        }
    }

    // Listen for changes in other tabs/windows
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === key && e.newValue !== null) {
                try {
                    const parsedValue = JSON.parse(e.newValue)
                    setStoredValue(parsedValue)
                } catch (error) {
                    console.error('Error parsing storage change:', error)
                }
            }
        }

        window.addEventListener('storage', handleStorageChange)
        return () => window.removeEventListener('storage', handleStorageChange)
    }, [key])

    // Add a single message to the array
    const addMessage = (message: Message) => {
        setValue((prevMessages) => [...prevMessages, message])
    }

    // Clear all messages
    const clearMessages = () => {
        setValue([])
    }

    return {
        messages: storedValue,
        setMessages: setValue,
        addMessage,
        clearMessages
    }
}

export default useLocalStorage
