import {Children, isValidElement, type ReactNode } from "react"
import styles from './Table.module.css'


type ColumnProps<T> = {
    field: keyof T
    title: string
    render?: (row: T, rowIndex: number) => ReactNode
}

export function Column<T>(_: ColumnProps<T>) {
    return null
}

type TableProps<T> = {
    data: T[]
    children: ReactNode
    rowKey: (row: T, index: number) => string | number
    emptyText?: string
}

function Table<T>({data, children, rowKey, emptyText = 'Данные отсутствут'}: TableProps<T>) {
    const columns = Children.toArray(children).filter(
        (child): child is React.ReactElement<ColumnProps<T>> => 
            isValidElement(child) && child.type === Column
    )

    if (data.length === 0) {
        <div>{emptyText}</div>
    }
    
    return (
        <table className={styles.table}>
            <thead>
                <tr>
                    {
                        columns.map(col => (
                            <th key={String(col.props.field)} className={styles.th}>
                                {col.props.title}
                            </th>
                        ))
                    }
                </tr>
            </thead>
            <tbody>
                {
                    data.map((row, rowIndex) => (
                        <tr key={rowKey(row, rowIndex)} className={styles.tr}>
                            {
                                columns.map((col) => {
                                    const { field, render } = col.props

                                    return (
                                        <td key={String(field)} className={styles.td}>
                                            {
                                                render
                                                    ? render(row, rowIndex)
                                                    : String(row[field] ?? '')
                                            }
                                        </td>
                                    )
                                })
                            }
                        </tr>
                    ))
                }
            </tbody>
        </table>
    )
}

Table.Column = Column
export default Table