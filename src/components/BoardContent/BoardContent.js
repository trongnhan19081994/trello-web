import { initialData } from 'actions/initialData'
import Column from 'components/Column/Column'
import { isEmpty } from 'lodash'
import React, { useEffect, useState } from 'react'
import { Container, Draggable } from 'react-smooth-dnd'
import { mapOrder } from 'utilities/sort'
import './BoardContent.scss'


function BoardContent() {
    const [board, setBoard] = useState({})
    const [columns, setColumns] = useState([])

    useEffect(() => {
        const boardFromDB = initialData.boards.find(board => board.id === 'board-1')
        if (boardFromDB) {
            setBoard(boardFromDB)

            setColumns(mapOrder(boardFromDB.columns, boardFromDB.columnOrder, 'id'))
        }
    }, [])
    if (isEmpty(board)) {
        return <div className="not-found">Board not found</div>
    }

    const onColumnDrop = (dropResult) => {
        console.log(dropResult)
    }

    return (
        <nav className="board-content">
            <Container
                orientation="horizontal"
                onDrop={onColumnDrop}
                getChildPayload={index => columns[index]}
                dragHandleSelector=".column-drag-handle"
                dropPlaceholder={{
                    animationDuration: 150,
                    showOnTop: true,
                    className: 'column-drop-preview'
                }}
            >
                {
                    columns.map(column => (
                        <Draggable key={column.id}>
                            <Column column={column} />
                        </Draggable>
                    ))
                }
            </Container>
        </nav>
    )
}

export default BoardContent

