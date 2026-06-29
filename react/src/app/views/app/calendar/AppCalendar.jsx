import { useEffect, useRef, useState } from "react";
import { Card, Col, Row } from "react-bootstrap";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction"; // needed for dayClick

import Breadcrumb from "app/components/Breadcrumb";
import CalendarEventDialog from "./CalendarEventDialog";

import { addNewEvent, updateEvent, deleteEvent, getAllEvents } from "./CalendarService";

export default function AppCalendarTwo() {
  const externalEventRef = useRef();
  const calendarComponentRef = useRef();

  const [state, setState] = useState({
    eventObject: {},
    newEventInput: "",
    calendarEvents: [],
    eventDialogOpen: false,
    calendarWeekends: false,
    deleteEventOnDrop: false,
    externalEvents: [
      { title: "Hello world" },
      { title: "Payment schedule" },
      { title: "Go to shopping" },
      { title: "Rend due" },
      { title: "Car rent" }
    ]
  });

  // const toggleWeekends = () => {
  //   setState((state) => ({ ...state, calendarWeekends: !state.calendarWeekends }));
  // };

  // const gotoPast = () => {
  //   const calendarApi = calendarComponentRef.current.getApi();
  //   calendarApi.gotoDate("2000-01-01"); // call a method on the Calendar object
  // };

  const handleDateClick = (arg) => {
    setState((prevState) => ({
      ...prevState,
      eventDialogOpen: true,
      eventObject: { title: "", start: arg.date, allDay: arg.allDay, classNames: ["text-white"] }
    }));
  };

  const handleEventDrop = async ({ event }) => {
    const { id, start, end, title, allDay, classNames, backgroundColor } = event || {};

    const { data } = await updateEvent({
      id,
      start,
      end,
      title,
      allDay,
      classNames,
      color: backgroundColor
    });

    refreshFullCalendar(data);
  };

  const handleExternalEventDrop = (event) => {
    let {
      allDay,
      date: start,
      draggedEl: {
        innerText: title,
        classList: { value: classNames }
      }
    } = event;

    handleEventDialogSubmit({
      start,
      title,
      allDay,
      classNames: classNames.concat(" text-white")
    });

    let { externalEvents = [], deleteEventOnDrop } = state;

    if (!deleteEventOnDrop) return;

    setState((prev) => ({
      ...prev,
      externalEvents: externalEvents.filter((item) => !item.title.match(title))
    }));
  };

  const handleDeleteEvent = async (id) => {
    if (!id) return;

    const { data } = await deleteEvent({ id });
    refreshFullCalendar(data);
  };

  const toggleEventDialog = () => {
    setState((prev) => ({ ...prev, eventDialogOpen: !prev.eventDialogOpen }));
  };

  const handleEventDialogSubmit = async (eventObject) => {
    let eventList = [];

    if (eventObject.id) {
      const { data } = await updateEvent(eventObject);
      eventList = data;
    } else {
      const { data } = await addNewEvent(eventObject);
      eventList = data;
    }

    refreshFullCalendar(eventList);
  };

  const handleEventClick = ({ event }) => {
    const { id, start, end, title, allDay, classNames, backgroundColor } = event || {};

    setState((prev) => ({
      ...prev,
      eventDialogOpen: true,
      eventObject: {
        id,
        title,
        start,
        end,
        allDay,
        classNames,
        color: backgroundColor
      }
    }));
  };

  const handleChange = (event) => {
    let title = event.target.value;

    if (event.key === "Enter") {
      title = title.trim();

      if (title) {
        setState((prev) => ({
          ...prev,
          newEventInput: "",
          externalEvents: [...prev.externalEvents, { title }]
        }));
      }
    } else {
      setState((prev) => ({ ...prev, newEventInput: title }));
    }
  };

  const refreshFullCalendar = (eventList = []) => {
    setState((prev) => ({
      ...prev,
      eventDialogOpen: false,
      calendarEvents: eventList.map((e) => ({
        id: e.id,
        end: e.end,
        color: e.color,
        start: e.start,
        title: e.title,
        allDay: e.allDay,
        classNames: e.classNames
      }))
    }));
  };

  useEffect(() => {
    getAllEvents().then(({ data }) => {
      setState((prevState) => ({ ...prevState, calendarEvents: data }));
    });
  }, []);

  const {
    eventObject,
    newEventInput,
    calendarEvents,
    eventDialogOpen,
    calendarWeekends,
    deleteEventOnDrop,
    externalEvents = []
  } = state;

  return (
    <div>
      <Breadcrumb routeSegments={[{ name: "Home", path: "/" }, { name: "Calendar" }]} />

      <Row>
        <Col md={3}>
          <Card body className="mb-4">
            <div className="create_event_wrap">
              <div className="form-group">
                <label htmlFor="newEvent"> Create new Event</label>
                <input
                  type="text"
                  name="newEvent"
                  className="form-control"
                  placeholder="new Event"
                  value={newEventInput}
                  onKeyUp={handleChange}
                  onChange={handleChange}
                />
              </div>

              <ul className="list-group" id="external-events" ref={externalEventRef}>
                {externalEvents.map((event, ind) => (
                  <li
                    key={ind}
                    style={{ backgroundColor: "#f5f5f5", color: "#000000" }}
                    className="list-group-item fc-event">
                    {event.title}
                  </li>
                ))}
              </ul>

              <p>
                <label className="checkbox checkbox-primary">
                  <input
                    type="checkbox"
                    name="agree"
                    value={deleteEventOnDrop}
                    checked={deleteEventOnDrop}
                    onChange={(e) => {
                      setState((prev) => ({ ...prev, deleteEventOnDrop: e.target.checked }));
                    }}
                  />
                  <span>Remove after drop</span>
                  <span className="checkmark"></span>
                </label>
              </p>
            </div>
          </Card>
        </Col>

        <Col md={9}>
          <Card body className="mb-4 o-hidden">
            <FullCalendar
              defaultView="dayGridMonth"
              header={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek"
              }}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              themeSystem="bootstrap"
              editable={true}
              droppable={true}
              eventLimit={true}
              displayEventTime={false}
              events={calendarEvents}
              ref={calendarComponentRef}
              weekends={calendarWeekends}
              dateClick={handleDateClick}
              eventDrop={handleEventDrop}
              eventResize={handleEventDrop}
              eventClick={handleEventClick}
              drop={handleExternalEventDrop}
            />
          </Card>
        </Col>
      </Row>

      <CalendarEventDialog
        open={eventDialogOpen}
        eventObject={eventObject}
        closeDialog={toggleEventDialog}
        handleDeleteEvent={handleDeleteEvent}
        handleSubmit={handleEventDialogSubmit}
      />
    </div>
  );
}
