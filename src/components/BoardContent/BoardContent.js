import Column from 'components/Column/Column'
import { isEmpty, cloneDeep } from 'lodash'
import React, { useEffect, useRef, useState } from 'react'
import { Container, Draggable } from 'react-smooth-dnd'
import { mapOrder } from 'utilities/sort'
import './BoardContent.scss'
import { applyDrag } from 'utilities/dragDrop'
import { Container as BootstrapContainer, Col, Row, Form, Button } from 'react-bootstrap'
import { fetchBoardDetails, createNewColum, updateBoard, updateColumn, updateCard } from 'actions/ApiCall'

function BoardContent() {
    const [board, setBoard] = useState({})
    const [columns, setColumns] = useState([])
    const [openNewColumnForm, setOpenNewColumnForm] = useState(false)
    const toggleOpenNewColumnForm = () => setOpenNewColumnForm(!openNewColumnForm)

    const newColumnInputRef = useRef(null)
    const [newColumTitle, setNewColumTitle] = useState('')
    const onNewColumTitleChange = e => setNewColumTitle(e.target.value)

    useEffect(() => {
        const boardId = '6106a3259f03937739b42e56'
        fetchBoardDetails(boardId).then(
            board => {
                setBoard(board)
                setColumns(mapOrder(board.columns, board.columnOrder, '_id'))
            }
        )
    }, [])

    useEffect(() => {
        if (newColumnInputRef && newColumnInputRef.current) {
            newColumnInputRef.current.focus()
            newColumnInputRef.current.select()
        }
    }, [openNewColumnForm])

    if (isEmpty(board)) {
        return <div className="not-found">Board not found</div>
    }

    const onColumnDrop = (dropResult) => {
        //console.log(dropResult)
        let newColumns = cloneDeep(columns)
        //console.log(newColumns)
        newColumns = applyDrag(newColumns, dropResult)
        //console.log(newColumns)
        let newBoard = cloneDeep(board)
        newBoard.columnOrder = newColumns.map(c => c._id)
        newBoard.columns = newColumns
        //console.log(newBoard)
        setColumns(newColumns)
        setBoard(newBoard)
        //Call Api update columnOrder in board details
        updateBoard(newBoard._id, newBoard).catch(() => {
            setColumns(columns)
            setBoard(board)
        })
    }

    const onCardDrop = (columnId, dropResult) => {
        if (dropResult.removedIndex !== null || dropResult.addedIndex !== null) {
            // console.log(columnId)
            //console.log(dropResult)
            let newColumns = cloneDeep(columns)
            let currentColumn = newColumns.find(c => c._id === columnId)
            //console.log(currentColumn)

            currentColumn.cards = applyDrag(currentColumn.cards, dropResult)
            currentColumn.cardOrder = currentColumn.cards.map(i => i._id)
            //console.log(currentColumn)
            if (dropResult.removedIndex !== null && dropResult.addedIndex !== null) {
                /* *
                    *Action: move card inside its column
                    *1 - Call api update cardOrder in current column
                */
                setColumns(columns)
                updateColumn(currentColumn._id, currentColumn).catch(() => setColumns(newColumns))
            } else {
                /* *
                    *Action: move card beetween two columns
                */
                //*1 - Call api update cardOrder in current column
                updateColumn(currentColumn._id, currentColumn).catch(() => setColumns(newColumns))
                if (dropResult.addedIndex !== null) {
                    let currentCard = cloneDeep(dropResult.payload)
                    currentCard.columnId = currentColumn._id
                    //*2 - Call api update column in current card
                    updateCard(currentCard._id, currentCard)
                }
            }
            //setColumns(newColumns)
        }
    }

    const addNewColumn = () => {
        if (!newColumTitle) {
            newColumnInputRef.current.focus()
            return
        }

        const newColumnToAdd = {
            boardId: board._id,
            title: newColumTitle.trim()
        }

        //Call Api
        createNewColum(newColumnToAdd).then(column => {
            let newColumns = [...columns]
            newColumns.push(column)

            let newBoard = { ...board }
            newBoard.columnOrder = newColumns.map(c => c._id)
            newBoard.columns = newColumns

            setColumns(newColumns)
            setBoard(newBoard)

            toggleOpenNewColumnForm()
            setNewColumTitle('')
        })
    }

    const onUpdateColumnState = (newColumnToUpdate) => {
        const columnIdToUpdate = newColumnToUpdate._id
        let newColumns = [...columns]
        const columnIndexToUpdate = newColumns.findIndex(c => c._id === columnIdToUpdate)
        if (newColumnToUpdate._destroy) {
            //remove column
            newColumns.splice(columnIndexToUpdate, 1)
        } else {
            //update column
            newColumns.splice(columnIndexToUpdate, 1, newColumnToUpdate)
        }

        let newBoard = { ...board }
        newBoard.columnOrder = newColumns.map(c => c._id)
        newBoard.columns = newColumns

        setColumns(newColumns)
        setBoard(newBoard)
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
                        <Draggable key={column._id}>
                            <Column
                                column={column}
                                onCardDrop={onCardDrop}
                                onUpdateColumnState={onUpdateColumnState}
                            />
                        </Draggable>
                    ))
                }
            </Container>
            <BootstrapContainer className="trello-container">
                {
                    !openNewColumnForm && (
                        <Row>
                            <Col className="add-new-column" onClick={toggleOpenNewColumnForm}>
                                <i className="fa fa-plus icon" /> Add another column
                            </Col>
                        </Row>
                    )
                }

                {
                    openNewColumnForm && (
                        <Row>
                            <Col className="enter-new-column">
                                <Form.Control size="sm"
                                    type="text"
                                    placeholder="Enter column title..."
                                    className="input-enter-new-column"
                                    ref={newColumnInputRef}
                                    value={newColumTitle}
                                    onChange={onNewColumTitleChange}
                                    onKeyDown={e => (e.key === 'Enter') && addNewColumn()}
                                />
                                <Button variant="success" size="sm" onClick={addNewColumn}>Add column</Button>
                                <span className="cancel-icon" onClick={toggleOpenNewColumnForm}> <i className="fa fa-trash icon" /> </span>
                            </Col>
                        </Row>
                    )
                }

            </BootstrapContainer>
        </nav>
    )
}

export default BoardContent

