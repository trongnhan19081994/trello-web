import Column from 'components/Column/Column'
import { isEmpty } from 'lodash'
import React, { useEffect, useRef, useState } from 'react'
import { Container, Draggable } from 'react-smooth-dnd'
import { mapOrder } from 'utilities/sort'
import './BoardContent.scss'
import { applyDrag } from 'utilities/dragDrop'
import { Container as BootstrapContainer, Col, Row, Form, Button } from 'react-bootstrap'
import { fetchBoardDetails, createNewColum } from 'actions/ApiCall'

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
        let newColumns = [...columns]
        //console.log(newColumns)
        newColumns = applyDrag(newColumns, dropResult)
        //console.log(newColumns)
        let newBoard = { ...board }
        newBoard.columnOrder = newColumns.map(c => c._id)
        newBoard.columns = newColumns
        //console.log(newBoard)

        setColumns(newColumns)
        setBoard(newBoard)
    }

    const onCardDrop = (columnId, dropResult) => {
        if (dropResult.removedIndex !== null || dropResult.addedIndex !== null) {
            // console.log(columnId)
            //console.log(dropResult)
            let newColumns = [...columns]
            let currentColumn = newColumns.find(c => c._id === columnId)
            //console.log(currentColumn)

            currentColumn.cards = applyDrag(currentColumn.cards, dropResult)
            currentColumn.cardOrder = currentColumn.cards.map(i => i._id)
            //console.log(currentColumn)

            setColumns(newColumns)
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

