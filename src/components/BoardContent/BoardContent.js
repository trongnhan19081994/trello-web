import { initialData } from 'actions/initialData'
import Column from 'components/Column/Column'
import { isEmpty } from 'lodash'
import React, { useEffect, useState } from 'react'
import { Container, Draggable } from 'react-smooth-dnd'
import { mapOrder } from 'utilities/sort'
import './BoardContent.scss'
import { applyDrag } from 'utilities/dragDrop'


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
        //console.log(dropResult)
        let newColumns = [...columns]
        newColumns = applyDrag(newColumns, dropResult)
        //console.log(newColumns)
        let newBoard = { ...board }
        newBoard.columnOrder = newColumns.map(c => c.id)
        newBoard.columns = newColumns
        //console.log(newBoard)

        setColumns(newColumns)
        setBoard(newBoard)
    }

    const onCardDrop = (columnId, dropResult) => {
        if (dropResult.removedIndex !== null || dropResult.addedIndex !== null) {
            // console.log(columnId)
            // console.log(dropResult)
            let newColumns = [...columns]
            let currentCulumn = newColumns.find(c => c.id === columnId)
            //console.log(currentCulumn)

            currentCulumn.cards = applyDrag(currentCulumn.cards, dropResult)
            currentCulumn.cardOrder = currentCulumn.cards.map(i => i.id)

            setColumns(newColumns)
        }
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
                            <Column column={column} onCardDrop={onCardDrop} />
                        </Draggable>
                    ))
                }
            </Container>
            <div className="add-new-column">
                <i className="fa fa-plus icon" /> Add another column
            </div>
        </nav>
    )
}

export default BoardContent

