import Card from 'components/Card/Card'
import ConfirmModal from 'components/Common/ConfirmModal'
import React, { useEffect, useRef, useState } from 'react'
import { Dropdown, Form, Button } from 'react-bootstrap'
import { Container, Draggable } from 'react-smooth-dnd'
import { MODAL_ACTION_CONFIRM } from 'utilities/constants'
import { mapOrder } from 'utilities/sort'
import './Column.scss'
import { saveContentAfterPressEnter, selectAllInlineText } from 'utilities/contentEditable'
import { cloneDeep } from 'lodash'
import { createNewCard, updateColumn } from 'actions/ApiCall'

function Column(props) {
    const { column, onCardDrop, onUpdateColumnState } = props
    const cards = mapOrder(column.cards, column.cardOrder, '_id')
    const [showConfirmModal, setShowConfirmModal] = useState(false)
    const [columnTitle, setColumnTitle] = useState('')

    const toogleShowConfirmModal = () => setShowConfirmModal(!showConfirmModal)

    const [openNewCardForm, setOpenNewCardForm] = useState(false)
    const toggleOpenNewCardForm = () => setOpenNewCardForm(!openNewCardForm)

    const [newCardTitle, setNewCardTitle] = useState('')
    const onNewCardTitleChange = e => setNewCardTitle(e.target.value)


    const newCardTextareRef = useRef(null)

    useEffect(() => {
        setColumnTitle(column.title)
    }, [column.title])

    useEffect(() => {
        if (newCardTextareRef && newCardTextareRef.current) {
            newCardTextareRef.current.focus()
            newCardTextareRef.current.select()
        }
    }, [openNewCardForm])

    const handleColumnTitleChange = (e) => setColumnTitle(e.target.value)

    const onConfirmModalAction = (type) => {
        if (type === MODAL_ACTION_CONFIRM) {
            const newColum = {
                ...column,
                _destroy: true
            }
            //Call Api update column
            updateColumn(newColum._id, newColum).then(updatedColum => {
                onUpdateColumnState(updatedColum)
            })
        }
        toogleShowConfirmModal()
    }

    //Update column title
    const handleColumnTitleBlur = () => {
        if (columnTitle !== column.title) {
            const newColum = {
                ...column,
                title: columnTitle
            }

            //Call Api update column
            updateColumn(newColum._id, newColum).then(updatedColum => {
                updatedColum.cards = newColum.cards
                onUpdateColumnState(updatedColum)
            })
        }
    }

    const addNewCard = () => {
        if (!newCardTitle) {
            newCardTextareRef.current.focus()
            return
        }

        const newCardToAdd = {
            boardId: column.boardId,
            columnId: column._id,
            title: newCardTitle.trim()
        }

        //Call Api
        createNewCard(newCardToAdd).then(card => {
            let newColum = cloneDeep(column)
            newColum.cards.push(card)
            newColum.cardOrder.push(card._id)

            onUpdateColumnState(newColum)
            setNewCardTitle('')
            toggleOpenNewCardForm()
        })

    }

    return (
        <div className="column">
            <header className="column-drag-handle">
                <div className="column-title">
                    <Form.Control size="sm"
                        type="text"
                        className="trello-content-editable"
                        value={columnTitle}
                        onChange={handleColumnTitleChange}
                        onBlur={handleColumnTitleBlur}
                        onKeyDown={saveContentAfterPressEnter}
                        onClick={selectAllInlineText}
                        onMouseDown={e => e.preventDefault()}
                        spellCheck="false"
                    />
                </div>
                <div className="column-dropdown-actions">
                    <Dropdown>
                        <Dropdown.Toggle id="dropdown-basic" size="sm" className="dropdown-btn" />
                        <Dropdown.Menu>
                            <Dropdown.Item onClick={toggleOpenNewCardForm}>Add Card...</Dropdown.Item>
                            <Dropdown.Item onClick={toogleShowConfirmModal}>Remove Column...</Dropdown.Item>
                            <Dropdown.Item>Move all cards in this column (beta)</Dropdown.Item>
                            <Dropdown.Item>Archive all cards in this column (beta)</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
            </header>
            <div className="card-list">
                <Container
                    groupName="group-columns"
                    onDrop={dropResult => onCardDrop(column._id, dropResult)}
                    getChildPayload={index => cards[index]}
                    dragClass="card-ghost"
                    dropClass="card-ghost-drop"
                    dropPlaceholder={{
                        animationDuration: 150,
                        showOnTop: true,
                        className: 'card-drop-preview'
                    }}
                    dropPlaceholderAnimationDuration={200}
                >
                    {
                        cards.map(card => (
                            <Draggable key={card._id}>
                                <Card card={card} />
                            </Draggable>
                        ))
                    }
                </Container>
                {openNewCardForm && (
                    <div className="add-new-card-area">
                        <Form.Control size="sm"
                            as="textarea"
                            row="3"
                            placeholder="Enter a title for this card..."
                            className="textarea-enter-new-card"
                            ref={newCardTextareRef}
                            value={newCardTitle}
                            onChange={onNewCardTitleChange}
                            onKeyDown={e => (e.key === 'Enter') && addNewCard()}
                        />
                    </div>
                )}

            </div>
            <footer>
                {openNewCardForm && (
                    <div className="add-new-card-action">
                        <Button variant="success" size="sm" onClick={addNewCard}>Add card</Button>
                        <span className="cancel-icon" onClick={toggleOpenNewCardForm}> <i className="fa fa-trash icon" /> </span>
                    </div>
                )}
                {!openNewCardForm && (
                    <div className="footer-actions" onClick={toggleOpenNewCardForm}>
                        <i className="fa fa-plus icon" /> Add another card
                    </div>
                )}
            </footer>
            <ConfirmModal
                title="Remove Column"
                show={showConfirmModal}
                onAction={onConfirmModalAction}
                content={`Are you sure you want to remove <strong> ${column.title} </strong>. <br/> All related cards will also be removed!`}
            />
        </div>
    )
}

export default Column

