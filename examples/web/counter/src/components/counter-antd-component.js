'use strict'; // eslint-disable-line

import React from 'react';

import {
    Row,
    Col,
    Button,
    InputNumber
} from 'antd';

import './css/main.css';

const CounterButtons = ({
    count,
    undoable,
    onIncrease,
    onDecrease,
    onUndo
}) => {
    return (
        <div>
            <Row>
                <Col gutter = { 5 }>
                    <Button
                        type = 'primary'
                        disabled = { count > 100 }
                        onClick = { onIncrease }
                    > + </Button>
                </Col>
                <Col>
                    <Button
                        type = 'primary'
                        disabled = { count < -100 }
                        onClick = { onDecrease }
                    > - </Button>
                </Col>
            </Row>
            <Row>
                <Button
                    type = { undoable ? `danger` : `dashed` }
                    disabled = { !undoable }
                    onClick = { onUndo }
                > UNDO </Button>
            </Row>
        </div>
    );
};

const Counter = ({
    undoable,
    count,
    offset,
    // outgoing,
    // getComponensOfChildInterfaces
    onIncrease,
    onDecrease,
    onUndo,
    onChange
}) => {
    return (
        <div>
            <CounterButtons
                count = { count }
                undoable = { undoable }
                onIncrease = { onIncrease }
                onDecrease = { onDecrease }
                onUndo = { onUndo }
            />
        </div>
    );
};

// <InputNumber
//     defaultValue = { 1 }
//     value = { offset }
//     onChange = {(event) => onChange(event)}
// />
// <h1 style = {{
//     color: `gray`,
//     fontFamily: `helvetica`,
//     fontSize: 32,
//     textAlign: `left`
// }}> Count = { count } </h1>
// <h2 style = {{
//     color: `gray`,
//     fontFamily: `helvetica`,
//     fontSize: 12,
//     textAlign: `left`,
//     paddingRight: 175
// }}> Version: 0.6 </h2>

export default Counter;
