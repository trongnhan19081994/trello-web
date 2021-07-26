import Card from 'components/Card/Card'
import ConfirmModal from 'components/Common/ConfirmModal'
import React, { useEffect, useState } from 'react'
import { Dropdown, Form } from 'react-bootstrap'
import { Container, Draggable } from 'react-smooth-dnd'
import { MODAL_ACTION_CONFIRM } from 'utilities/constants'
import { mapOrder } from 'utilities/sort'
import './Column.scss'
import { saveContentAfterPressEnter, selectAllInlineText } from 'utilities/contentEditable'

function Column(props) {
    const { column, onCardDrop, onUpdateColumn } = props
    const cards = mapOrder(column.cards, column.cardOrder, 'id')
    const [showConfirmModal, setShowConfirmModal] = useState(false)
    const [columnTitle, setColumnTitle] = useState('')

    const toogleShowConfirmModal = () => setShowConfirmModal(!showConfirmModal)

    useEffect(() => {
        setColumnTitle(column.title)
    }, [column.title])

    const handleColumnTitleChange = (e) => setColumnTitle(e.target.value)

    const onConfirmModalAction = (type) => {
        if (type === MODAL_ACTION_CONFIRM) {
            const newColum = {
                ...column,
                _destroy: true
            }
            onUpdateColumn(newColum)
        }
        toogleShowConfirmModal()
    }

    const handleColumnTitleBlur = () => {
        const newColum = {
            ...column,
            title: columnTitle
        }
        onUpdateColumn(newColum)
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
                            <Dropdown.Item >Add Card...</Dropdown.Item>
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
                    onDrop={dropResult => onCardDrop(column.id, dropResult)}
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
                            <Draggable key={card.id}>
                                <Card card={card} />
                            </Draggable>
                        ))
                    }
                </Container>
            </div>
            <footer>
                <div className="footer-actions">
                    <i className="fa fa-plus icon" /> Add another card
                </div>
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

