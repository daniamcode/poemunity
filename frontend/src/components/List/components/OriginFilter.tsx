import React from 'react'
interface OriginFilterProps {
    value: string
    onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void
}

export function OriginFilter({ value, onChange }: OriginFilterProps) {
    return (
        <form className='list__sort'>
            <label>
                Authors:
                <select id='origin' name='origin' onChange={onChange} value={value}>
                    <option value='all'>All</option>
                    <option value='famous'>Famous</option>
                    <option value='user'>Users</option>
                </select>
            </label>
        </form>
    )
}
