import Column from 'components/Column/Column'
import React, { useEffect, useState } from 'react'
import './BoardContent.scss'
import { isEmpty } from 'lodash'
import { mapOrder } from 'utilities/sort'

import { initialData } from 'actions/initialData'

function BoardContent() {
    const [board, setBoard] = useState({})
    const [columns, setColumns] = useState([])

    useEffect(() => {
        const boardFromDB = initialData.boards.find(board => board.id === 'board-1')
        if (boardFromDB) {
            setBoard(boardFromDB)

            //Sort column
            // boardFromDB.columns.sort((a, b) =>
            //     boardFromDB.columnOrder.indexOf(a.id) - boardFromDB.columnOrder.indexOf(b.id)
            // )

            setColumns(mapOrder(boardFromDB.columns, boardFromDB.columnOrder, 'id'))
        }
    }, [])
    if (isEmpty(board)) {
        return <div className="not-found">Board not found</div>
    }
    return (
        <nav className="board-content">
            {
                columns.map(column => <Column key={column.id} column={column} />)
            }
        </nav>
    )
}

export default BoardContent

