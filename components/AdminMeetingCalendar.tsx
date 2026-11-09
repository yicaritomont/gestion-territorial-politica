'use client';

import Link from 'next/link';
import {useState} from 'react';
import CreateMeeting from '@/components/forms/CreateMeeting';

type Meeting={
  id:string;
  name:string;
  meeting_date:string;
  meeting_time:string|null;
  status:string;
  public_token:string;
  place:string|null;
  communes:{name:string}|{name:string}[]|null;
};

function dateKey(date:Date){
  const year=date.getFullYear();
  const month=String(date.getMonth()+1).padStart(2,'0');
  const day=String(date.getDate()).padStart(2,'0');
  return `${year}-${month}-${day}`;
}

function parseDate(value:string){
  const [year,month,day]=value.slice(0,10).split('-').map(Number);
  return new Date(year,month-1,day);
}

function addMonths(date:Date,amount:number){
  return new Date(date.getFullYear(),date.getMonth()+amount,1);
}

export default function AdminMeetingCalendar({meetings,communes,todayDate}:{
  meetings:Meeting[];
  communes:{id:string;name:string}[];
  todayDate:string;
}){
  const today=parseDate(todayDate);
  const [month,setMonth]=useState(()=>new Date(today.getFullYear(),today.getMonth(),1));
  const [selectedDate,setSelectedDate]=useState(todayDate);
  const [createOpen,setCreateOpen]=useState(false);

  const firstDay=new Date(month.getFullYear(),month.getMonth(),1);
  const gridStart=new Date(firstDay);
  gridStart.setDate(firstDay.getDate()-((firstDay.getDay()+6)%7));
  const days=Array.from({length:42},(_,index)=>{
    const date=new Date(gridStart);
    date.setDate(gridStart.getDate()+index);
    return date;
  });
  const meetingsByDate=new Map<string,Meeting[]>();
  for(const meeting of meetings){
    const key=meeting.meeting_date.slice(0,10);
    const dayMeetings=meetingsByDate.get(key)||[];
    dayMeetings.push(meeting);
    meetingsByDate.set(key,dayMeetings);
  }
  const selectedMeetings=(meetingsByDate.get(selectedDate)||[])
    .slice()
    .sort((a,b)=>(a.meeting_time||'').localeCompare(b.meeting_time||''));
  const selectedDateLabel=parseDate(selectedDate).toLocaleDateString('es-CO',{
    weekday:'long',day:'numeric',month:'long',year:'numeric'
  });
  const monthLabel=month.toLocaleDateString('es-CO',{month:'long',year:'numeric'});

  function chooseDate(date:Date){
    const key=dateKey(date);
    setSelectedDate(key);
    if(date.getMonth()!==month.getMonth()||date.getFullYear()!==month.getFullYear()){
      setMonth(new Date(date.getFullYear(),date.getMonth(),1));
    }
    setCreateOpen(true);
  }

  return <section className="card adminCalendar">
    <div className="calendarHeader">
      <div>
        <h2>Agenda de reuniones</h2>
        <p className="muted">Selecciona un día para programar una reunión con esa fecha.</p>
      </div>
      <div className="calendarMonthControls">
        <button className="mini" type="button" aria-label="Mes anterior" onClick={()=>setMonth(value=>addMonths(value,-1))}>‹</button>
        <strong>{monthLabel}</strong>
        <button className="mini" type="button" aria-label="Mes siguiente" onClick={()=>setMonth(value=>addMonths(value,1))}>›</button>
        <button className="btn alt" type="button" onClick={()=>{
          setMonth(new Date(today.getFullYear(),today.getMonth(),1));
          setSelectedDate(todayDate);
        }}>Hoy</button>
      </div>
    </div>
    <div className="calendarLayout">
      <div className="calendarGrid" role="grid" aria-label={`Calendario de ${monthLabel}`}>
        {['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'].map(day=><div className="calendarWeekday" role="columnheader" key={day}>{day}</div>)}
        {days.map(date=>{
          const key=dateKey(date);
          const dayMeetings=meetingsByDate.get(key)||[];
          const inMonth=date.getMonth()===month.getMonth();
          const isSelected=key===selectedDate;
          const isToday=key===todayDate;
          return <button
            type="button"
            role="gridcell"
            aria-label={`${date.toLocaleDateString('es-CO',{day:'numeric',month:'long'})}, ${dayMeetings.length} reuniones. Seleccionar para crear reunión.`}
            aria-pressed={isSelected}
            className={`calendarDay${inMonth?'':' outside'}${isSelected?' selected':''}${isToday?' today':''}`}
            key={key}
            onClick={()=>chooseDate(date)}
          >
            <span className="calendarDayNumber">{date.getDate()}</span>
            <span className="calendarDayEvents">
              {dayMeetings.slice(0,2).map(meeting=><span className="calendarEvent" key={meeting.id}>
                {meeting.meeting_time?.slice(0,5)&&<b>{meeting.meeting_time.slice(0,5)} </b>}{meeting.name}
              </span>)}
              {dayMeetings.length>2&&<span className="calendarMore">+{dayMeetings.length-2} más</span>}
            </span>
          </button>;
        })}
      </div>
      <aside className="calendarAgenda" aria-live="polite">
        <div className="sectionHead">
          <div>
            <h3>Agenda del día</h3>
            <p className="muted">{selectedDateLabel}</p>
          </div>
          <button className="btn" type="button" onClick={()=>setCreateOpen(true)}>+ Reunión</button>
        </div>
        {selectedMeetings.length
          ?<ul className="agendaList">
            {selectedMeetings.map(meeting=><li key={meeting.id}>
              <span className="agendaTime">{meeting.meeting_time?.slice(0,5)||'Hora pendiente'}</span>
              <div>
                <b>{meeting.name}</b>
                <p>{[(Array.isArray(meeting.communes)?meeting.communes[0]:meeting.communes)?.name,meeting.place].filter(Boolean).join(' · ')||'Sin lugar especificado'}</p>
                <span className="badge">{meeting.status}</span>{' '}
                <Link className="textLink" href={`/admin/reuniones/${meeting.public_token}`}>Ver reunión</Link>
              </div>
            </li>)}
          </ul>
          :<p className="muted">No hay reuniones programadas para este día.</p>}
      </aside>
    </div>
    <CreateMeeting
      communes={communes}
      initialDate={selectedDate}
      open={createOpen}
      onOpenChange={setCreateOpen}
      showTrigger={false}
    />
  </section>;
}
