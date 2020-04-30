'use strict'; // eslint-disable-line

import moment from 'moment';

import React from 'react';

import {
    Paper,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    ListItemSecondaryAction,
    Button,
    Input,
    OutlinedInput,
    Checkbox,
    IconButton,
    Typography,
    FormControl,
    FormControlLabel,
    RadioGroup,
    Radio
} from '@material-ui/core';

import {
    Delete as DeleteIcon
} from '@material-ui/icons';

import {
    MuiThemeProvider,
    createMuiTheme
} from '@material-ui/core/styles';

import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    root: {
        justifyContent: `center`,
        alignContent: `center`,
        alignItems: `center`,
        alignSelf: `center`,
        padding: `20px`,
        margin: `20px`
    },
    inputForm: {
        display: `flex`,
        textAlign: `left`,
        width: `100%`
    },
    inputNew: {
        width: `100%`,
        height: `55px`,
        fontSize: `1.5em`,
        marginLeft: theme.spacing(2),
        marginRight: theme.spacing(2)
    },
    inputEdit: {
        width: `100%`,
        height: `30px`,
        fontSize: `0.9em`
    },
    setting: {
        justifyContent: `center`,
        alignContent: `center`,
        alignItems: `center`,
        alignSelf: `center`
        // backgroundColor: `red`
    }
}));

const theme = createMuiTheme({
    palette: {
        primary: {
            main: `#03a9f4`
        },
        secondary: {
            main: `#ff3d00`
        }
    }
});

const NewTaskMessageInput = React.forwardRef(({
    placeholder = ``,
    value = ``,
    onSubmit
}, ref) => {
    const classes = useStyles();
    const [ message, setMessage ] = React.useState(value);

    return (
        <form
            className = { classes.inputForm }
            ref = { ref }
            noValidate
            autoComplete = 'off'
            onBlur = {() => {
                if (message !== ``) {
                    onSubmit(message);
                    setMessage(``);
                }
            }}
            onSubmit = {(event) => {
                event.preventDefault();
                if (message !== ``) {
                    onSubmit(message);
                    setMessage(``);
                }
            }}
        >
            <OutlinedInput
                className = { classes.inputNew }
                placeholder = { placeholder}
                value = { message }
                onChange = {(event) => {
                    setMessage(event.target.value);
                }}
            />
        </form>
    );
});

const EditTaskMessageInput = React.forwardRef(({
    placeholder = ``,
    value = ``,
    timestamp = ``,
    color = theme.palette.primary.main,
    readOnly = false,
    lineThrough = false,
    onSubmit
}, ref) => {
    const classes = useStyles();
    const [ message, setMessage ] = React.useState(value);
    return (
        <ListItemText primary = {
            <form
                ref = { ref }
                className = { classes.inputForm }
                noValidate
                autoComplete = 'off'
                onBlur = {() => {
                    if (message !== ``) {
                        onSubmit(message);
                    }
                }}
                onSubmit = {(event) => {
                    event.preventDefault();
                    if (message !== ``) {
                        onSubmit(message);
                    }
                }}
            >
                <Input
                    className = { classes.inputEdit }
                    style = {{
                        color,
                        textDecoration: lineThrough ? `line-through` : `inherit`
                    }}
                    readOnly = { readOnly }
                    disableUnderline = { true }
                    placeholder = { placeholder}
                    value = { message }
                    onChange = {(event) => {
                        setMessage(event.target.value);
                    }}
                />
            </form>
        } secondary = {
            <Typography
                variant = 'caption'
                display = 'block'
                color = 'textSecondary'
                align = 'left'
                gutterBottom
            >{ moment(timestamp).format(`L`) }</Typography>
        }/>
    );
});

const TaskList = ({
    tasks,
    onEditTask,
    onDeleteTask
}) => (
    <List> {
        tasks.map(({
            timestamp,
            message,
            editing,
            completed
        }) => {
            const labelId = `task-list-label-${timestamp}`;

            return (
                <ListItem
                    key = { timestamp }
                    role = { undefined }
                    button = { false }
                    divider
                >
                    <ListItemIcon >
                        <Checkbox
                            edge = 'start'
                            checked = { completed }
                            disabled = { editing }
                            tabIndex = { -1 }
                            inputProps = {{
                                'aria-labelledby': labelId
                            }}
                            onChange = {(event) => {
                                onEditTask({
                                    timestamp,
                                    completed: event.target.checked
                                });
                            }}
                        />
                    </ListItemIcon>
                    <EditTaskMessageInput
                        value = { message }
                        timestamp = { timestamp }
                        color = { editing ? theme.palette.secondary.main : theme.palette.primary.main }
                        lineThrough = { completed }
                        readOnly = { completed }
                        onSubmit = {(editedMessage) => onEditTask({
                            timestamp,
                            message: editedMessage,
                            editing: false
                        })}
                    />
                    <ListItemSecondaryAction>
                        <IconButton
                            edge = 'end'
                            aria-label = 'comments'
                            onClick = {() => onDeleteTask(timestamp)}
                        >
                            <DeleteIcon/>
                        </IconButton>
                    </ListItemSecondaryAction>
                </ListItem>
            );
        })
    } <
    /List>
);

const Todo = ({
    setting,
    tasks,
    filteredTasks,
    status,
    onInsertTask,
    onEditTask,
    onDeleteTask,
    onDeleteCompletedTask,
    onChangeFilter
}) => {
    const classes = useStyles();
    const hasTasks = tasks.length;
    const hasCompletion = tasks.some((task) => task.completed);

    return (
        <MuiThemeProvider theme = { theme }>
            <Paper className = { classes.root } >
                <Typography
                    variant = 'h3'
                    component = 'h4'
                    color = 'textSecondary'
                    align = 'center'
                    gutterBottom
                >
                  Todos
                </Typography>
                <NewTaskMessageInput
                    placeholder = 'What needs to be done?'
                    onSubmit = { onInsertTask }
                />
                <TaskList
                    tasks = { filteredTasks }
                    onEditTask = { onEditTask }
                    onDeleteTask = { onDeleteTask }
                />
                <Typography
                    variant = 'caption'
                    display = 'block'
                    color = 'textSecondary'
                    align = 'left'
                    gutterBottom
                >{ status }</Typography>
                <div className = { classes.setting } >{
                    hasTasks ? <FormControl component = 'fieldset' >
                        <RadioGroup
                            aria-label = 'setting'
                            name = 'setting'
                            row
                            value = { setting.currentFilter }
                            onChange = {(event) => onChangeFilter(event.target.value)}
                        >
                            <FormControlLabel
                                value = 'all'
                                control = {
                                    <Radio color = 'primary' size = 'small' />
                                }
                                label = 'All'
                                labelPlacement = 'bottom'
                                color = 'textSecondary'
                            />
                            <FormControlLabel
                                value = 'active'
                                control = {
                                    <Radio color = 'primary' size = 'small' />
                                }
                                label = 'Active'
                                labelPlacement = 'bottom'
                                color = 'textSecondary'
                            />
                            <FormControlLabel
                                value = 'completed'
                                control = {
                                    <Radio color = 'primary' size = 'small' />
                                }
                                label = 'Completed'
                                labelPlacement = 'bottom'
                                color = 'textSecondary'
                            />
                        </RadioGroup>
                        {
                            hasCompletion ? <Button
                                color = 'secondary'
                                onClick = {() => onDeleteCompletedTask()}
                            > Clear Completion </Button> : null
                        }
                    </FormControl> : null
                }</div>
            </Paper>
        </MuiThemeProvider>
    );
};

export default Todo;
