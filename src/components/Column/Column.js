import Task from 'components/Task/Task'
import React from 'react'
import './Column.scss'

function Column() {
    return (
        <div className="column">
            <header> Brainstorm </header>
            <ul className="task-list">
                <li className="task-item">
                    <img src="https://www.imgonline.com.ua/examples/rainbow-background-2-big.jpg" alt="image title" />
                    Title: Image title
                </li>
                <Task />
                <Task />
                <Task />
                <Task />
            </ul>
            <footer>Add another card</footer>
        </div>
    )
}

export default Column

