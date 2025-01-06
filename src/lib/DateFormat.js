export const formatDate = (date) => {
    console.log(date)
    return new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' })
      .format(date);
  };
export const formatMonth = (date) => {
    return new Intl.DateTimeFormat('en-CA', { month: '2-digit', day: '2-digit' })
      .format(date);
  };