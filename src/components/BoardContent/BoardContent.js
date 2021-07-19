import Column from 'components/Column/Column'
import React from 'react'
import './BoardContent.scss'

function BoardContent() {
    return (
        <nav className="board-content">
            <Column />
            <Column />
            <Column />
            <Column />
        </nav>
    )
}

export default BoardContent

