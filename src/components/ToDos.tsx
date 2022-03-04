import React, 
{
  useState
} from 'react';

import Typography from '@material-ui/core/Typography';

import ToDoItem from './ToDoItem';
import ToDoModal from './ToDoModal';

const ToDos: React.FC<any> = ({ todos, fetchDetails }) => {

  const [open, setOpen] = React.useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };


  const [modalContent, setModalContent] = useState();

  const updateModalState = (value: any) => {
    setModalContent(value);
    handleOpen();
    //setShowModal(true);
  }
  
  return (
    <>
      <ToDoModal 
        open = {open}
        handleOpen = {handleOpen}
        handleClose = {handleClose}
        modalContent = {modalContent}
        setModalContent = {setModalContent}
        fetchDetails={fetchDetails}
      />

      {todos.length === 0 && <Typography>No Schedule found!!!</Typography>}

      {todos.length > 0 && todos.map((todo: any, k:number) => (
        <ToDoItem 
          key={todo.ScheduledID + todo.StopType}
          id={todo.ScheduledID}
          details={todo}
          updateModalState={updateModalState}
          fetchDetails={fetchDetails}/>
      ))}
    </>
  )
}

export default ToDos;
