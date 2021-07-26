import { initialData } from 'actions/initialData'
import Column from 'components/Column/Column'
import { isEmpty } from 'lodash'
import React, { useEffect, useRef, useState } from 'react'
import { Container, Draggable } from 'react-smooth-dnd'
import { mapOrder } from 'utilities/sort'
import './BoardContent.scss'
import { applyDrag } from 'utilities/dragDrop'
import { Container as BootstrapContainer, Col, Row, Form, Button } from 'react-bootstrap'


function BoardContent() {
    const [board, setBoard] = useState({})
    const [columns, setColumns] = useState([])
    const [openNewColumnForm, setOpenNewColumnForm] = useState(false)
    const newColumnInputRef = useRef(null)
    const [newColumTitle, setNewColumTitle] = useState('')

    useEffect(() => {
        const boardFromDB = initialData.boards.find(board => board.id === 'board-1')
        if (boardFromDB) {
            setBoard(boardFromDB)
            setColumns(mapOrder(boardFromDB.columns, boardFromDB.columnOrder, 'id'))
        }
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
        newBoard.columnOrder = newColumns.map(c => c.id)
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
            let currentColumn = newColumns.find(c => c.id === columnId)
            //console.log(currentColumn)

            currentColumn.cards = applyDrag(currentColumn.cards, dropResult)
            currentColumn.cardOrder = currentColumn.cards.map(i => i.id)
            //console.log(currentColumn)

            setColumns(newColumns)
        }
    }

    const toggleOpenNewColumnForm = () => setOpenNewColumnForm(!openNewColumnForm)

    const addNewColumn = () => {
        if (!newColumTitle) {
            newColumnInputRef.current.focus()
            return
        }

        const newColumnToAdd = {
            id: Math.random().toString(36).substr(2, 5), // 5 random characters
            boardId: board.id,
            title: newColumTitle.trim(),
            cardOrder: [],
            cards: []
        }

        let newColumns = [...columns]
        newColumns.push(newColumnToAdd)

        let newBoard = { ...board }
        newBoard.columnOrder = newColumns.map(c => c.id)
        newBoard.columns = newColumns

        setColumns(newColumns)
        setBoard(newBoard)

        toggleOpenNewColumnForm()
        setNewColumTitle('')
    }

    const onUpdateColumn = (newColumnToUpdate) => {
        const columnIdToUpdate = newColumnToUpdate.id
        let newColumns = [...columns]
        const columnIndexToUpdate = newColumns.findIndex(c => c.id === columnIdToUpdate)
        if (newColumnToUpdate._destroy) {
            //remove column
            newColumns.splice(columnIndexToUpdate, 1)
        } else {
            //update column
            newColumns.splice(columnIndexToUpdate, 1, newColumnToUpdate)
        }

        let newBoard = { ...board }
        newBoard.columnOrder = newColumns.map(c => c.id)
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
                        <Draggable key={column.id}>
                            <Column column={column} onCardDrop={onCardDrop} onUpdateColumn={onUpdateColumn} />
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
                                    onChange={e => setNewColumTitle(e.target.value)}
                                    onKeyDown={e => (e.key === 'Enter') && addNewColumn()}
                                />
                                <Button variant="success" size="sm" onClick={addNewColumn}>Add column</Button>
                                <span className="cancel-new-column" onClick={toggleOpenNewColumnForm}> <i className="fa fa-trash icon" /> </span>
                            </Col>
                        </Row>
                    )
                }

            </BootstrapContainer>
        </nav>
    )
}

export default BoardContent

