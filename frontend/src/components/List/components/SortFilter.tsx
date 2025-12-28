import React from 'react'
import { ORDER_BY, ORDER_BY_DATE, ORDER_BY_LIKES, ORDER_BY_RANDOM, ORDER_BY_TITLE } from '../../../data/constants'

interface SortFilterProps {
    value: string
    onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void
}

export function SortFilter({ value, onChange }: SortFilterProps) {
    return (
        <form className='list__sort'>
            <label>
                {ORDER_BY}
                <select id='sort' name='sort' onChange={onChange} value={value} data-testid='order-select'>
                    <option value={ORDER_BY_LIKES} data-testid='select-option'>
                        {ORDER_BY_LIKES}
                    </option>
                    <option value={ORDER_BY_DATE} data-testid='select-option'>
                        {ORDER_BY_DATE}
                    </option>
                    <option value={ORDER_BY_RANDOM} data-testid='select-option'>
                        {ORDER_BY_RANDOM}
                    </option>
                    <option value={ORDER_BY_TITLE} data-testid='select-option'>
                        {ORDER_BY_TITLE}
                    </option>
                </select>
            </label>
        </form>
    )
}
