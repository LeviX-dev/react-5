import Mock from "../mock";
import shortid from "shortid";

const date = new Date();

const calendarEventDB = {
  events: [
    {
      id: "344jdfher3wh23",
      title: "Meeting with all employees",
      start: new Date(date.getFullYear(), date.getMonth(), 1),
      end: new Date(date.getFullYear(), date.getMonth(), 3),
      classNames: ["text-white"],
      allDay: true
    },
    {
      id: "344jdfher3wh245",
      title: "A trip to Bali Island",
      start: new Date(),
      end: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 2),
      classNames: ["text-white"],
      allDay: true
    }
  ]
};

Mock.onGet("/api/calendar/events/all").reply(() => {
  return [200, calendarEventDB.events];
});

Mock.onPost("/api/calendar/events/add").reply((config) => {
  let { start, end, ...others } = JSON.parse(config.data);

  const event = {
    id: shortid.generate(),
    start: new Date(start),
    end: new Date(end),
    ...others
  };

  calendarEventDB.events.push(event);
  return [200, calendarEventDB.events];
});

Mock.onPost("/api/calendar/events/update").reply((config) => {
  const body = JSON.parse(config.data);

  const updatedEvents = calendarEventDB.events.map((event) => {
    return event.id === body.id ? { ...body } : event;
  });

  return [200, updatedEvents];
});

Mock.onPost("/api/calendar/events/delete").reply((config) => {
  let event = JSON.parse(config.data);
  const data = calendarEventDB.events.filter((el) => el.id !== event.id);
  return [200, data];
});
