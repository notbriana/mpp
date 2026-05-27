export function validateAssignment(form) {
  const errors = {};

  const title = (form.title || '').trim();
  if (!title) {
    errors.title = 'Title is required.';
  } else if (title.length > 200) {
    errors.title = 'Title must be 200 characters or fewer.';
  }

  if (!form.due_date) {
    errors.due_date = 'Due date is required.';
  } else {
    const date = new Date(form.due_date);
    if (isNaN(date.getTime())) {
      errors.due_date = 'Please enter a valid date.';
    }
  }

  if (!['High', 'Medium', 'Low'].includes(form.priority)) {
    errors.priority = 'Select a valid priority.';
  }

  if (!['Not Started', 'In Progress', 'Completed'].includes(form.status)) {
    errors.status = 'Select a valid status.';
  }

  if (form.description && form.description.length > 500) {
    errors.description = 'Description must be 500 characters or fewer.';
  }

  return errors;
}
