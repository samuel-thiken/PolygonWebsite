import React, { useEffect, useState } from "react";
import Section from "../partials/Section";
import { LineChart, XAxis, YAxis, CartesianGrid, Line, ResponsiveContainer, Legend, ReferenceArea, Label, BarChart, Bar } from "recharts";
import superagent from "superagent";
import ReactLoading from "react-loading";
import I18n, { useI18n } from "../utils/I18n";
import { MapName } from "../partials/Map";
import DatePicker from "react-datepicker";
import moment from "moment";
import "react-datepicker/dist/react-datepicker.css";

interface PlayerCountData {
  day: `${number}/${number}/${number}`;
  hour: `${number}:${number}`;
  playersMax: number;
  playersMin: number;
  playersAvg: number;
  map: string;
}
interface MapDurationData {
  start: string;
  end: string;
  map: string;
}

const colors = {
  playersMax: "#46ad0e",
  playersMin: "#ad190e",
  playersAvg: "#e0b012"
};
const textStyle: React.CSSProperties = {
  fontSize: "0.8rem",
  fill: "#fff",
  fontWeight: 500
};

export default function Stats(): React.ReactElement {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [dateData, setDateData] = useState<Array<PlayerCountData>>();

  const [rangeStartDate, setRangeStartDate] = useState<Date | null>(moment().subtract(1, "month").toDate());
  const [rangeEndDate, setRangeEndDate] = useState<Date | null>(new Date());
  const [rangeAverageData, setRangeAverageData] = useState<Array<PlayerCountData>>();

  const { getI18nText, language } = useI18n();

  const maxPlayers = 70;
  const mapsHeight = 10;

  const sortData = (data: Array<PlayerCountData>): Array<PlayerCountData> =>
    data.sort((a, b) => {
      let aHour = parseInt(a.hour.slice(0, 2));
      const aMinutes = parseInt(a.hour.slice(3, 5));
      let bHour = parseInt(b.hour.slice(0, 2));
      const bMinutes = parseInt(b.hour.slice(3, 5));

      if (aHour < 10) aHour += 24;
      if (bHour < 10) bHour += 24;

      if (aHour !== bHour) return aHour - bHour;
      return aMinutes - bMinutes;
    });

  const parseMapsDuration = (data: Array<PlayerCountData>): Array<MapDurationData> => {
    const result: Array<MapDurationData> = [];
    if (data.length == 0) return result;
    let currentMap = {
      start: data[0].hour,
      map: data[0].map
    };
    for (const d of data) {
      if (d.map !== currentMap.map) {
        result.push({
          ...currentMap,
          end: d.hour
        });
        currentMap = {
          start: d.hour,
          map: d.map
        };
      }
    }
    result.push({
      ...currentMap,
      end: data[data.length - 1].hour
    });
    return result;
  };

  const getMapsDisplay = (data: Array<PlayerCountData>): JSX.Element[] =>
    parseMapsDuration(data).map((d, i) => {
      const map = d.map ? d.map.toLowerCase() : "mp_prison";
      const mapname = getI18nText(`shortmaps.${d.map as MapName}`) || "Mapname";
      const randomNumber = Math.floor(Math.random() * 10000);
      return (
        <ReferenceArea
          key={i}
          y1={maxPlayers}
          y2={maxPlayers + mapsHeight}
          x1={d.start}
          x2={d.end}
          ifOverflow={"visible"}
          shape={
            <svg fillOpacity={1}>
              <defs>
                <pattern id={`${map}-${randomNumber}`} patternUnits="objectBoundingBox" width="100%" height="100%" x="0" y="0">
                  <image x="0" y="0" height={"100%"} width={"100%"} href={`/assets/images/maps/wide/${map}.jpg`} preserveAspectRatio="xMinYMax slice" />
                </pattern>
              </defs>
              <rect x="0" y="0" width={"100%"} height="100%" fill={`url(#${map}-${randomNumber})`}></rect>
            </svg>
          }
          // label={<Label value={mapname} position={i % 2 == 0 ? "insideTopRight" : "insideBottomRight"} style={{ ...textStyle, textTransform: "uppercase", fontSize: "0.6rem" }} />}
          label={<Label angle={40} value={mapname} position={"insideBottomRight"} style={{ ...textStyle, textTransform: "uppercase", fontSize: "0.6rem" }} />}
        />
      );
    });

  const onRangeChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    setRangeStartDate(start);
    setRangeEndDate(end);
  };

  // Date
  useEffect(() => {
    superagent
      .get(`${process.env.REACT_APP_API_SERVER}/stats/date`)
      .query({ date: selectedDate?.toISOString() })
      .then((res) => {
        setDateData(sortData(res.body.data));
      });
  }, [selectedDate]);
  // Range
  useEffect(() => {
    superagent
      .get(`${process.env.REACT_APP_API_SERVER}/stats/average`)
      .query({ startDate: rangeStartDate?.toISOString(), endDate: rangeEndDate?.toISOString() })
      .set("Content-Type", "application/json")
      .end((err, res) => {
        if (!err) setRangeAverageData(sortData(res.body.data));
      });
  }, [rangeStartDate, rangeEndDate]);

  return (
    <>
      <Section type="primary">
        <div className="m-5">
          <p className="title">
            <I18n t="stats.title" />
          </p>
          <p className="subtitle">
            <I18n t="stats.subtitle" />
          </p>
        </div>
        <div className="mt-5">
          <p>
            <I18n t="stats.description" />
          </p>
        </div>
      </Section>
      <Section>
        <p className="subtitle text-uppercase section-title">
          <I18n t="stats.today.title" />
        </p>
        <div>
          <DatePicker selected={selectedDate} onChange={(date) => setSelectedDate(date)} />
        </div>
        {dateData ? (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={dateData}>
              <XAxis dataKey="hour" interval={3} />
              <YAxis domain={[0, maxPlayers + mapsHeight]} ticks={[0, 20, 40, 64]} />
              <Legend />
              <CartesianGrid stroke="#eee" strokeDasharray="5 5" vertical={false} />
              <Line type="monotone" strokeWidth={2} dataKey="playersMin" stroke={colors.playersMin} dot={false} />
              <Line type="monotone" strokeWidth={2} dataKey="playersAvg" stroke={colors.playersAvg} dot={false} />
              <Line type="monotone" strokeWidth={2} dataKey="playersMax" stroke={colors.playersMax} dot={false} />
              {/* <Line type="monotone" strokeWidth={2} dataKey="bots" stroke={colors.bots} dot={false} /> */}
              {/* <Line type="monotone" strokeWidth={2} dataKey="players" stroke={colors.players} dot={false} /> */}
              {/* <Line type="monotone" strokeWidth={3} dataKey="total" stroke={colors.total} dot={false} /> */}
              {getMapsDisplay(dateData)}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <ReactLoading className="centered" type="bars" />
        )}
      </Section>
      <Section>
        <p className="subtitle text-uppercase section-title">
          <I18n t="stats.average.title" />
        </p>
        <div>
          <DatePicker selected={rangeStartDate} onChange={onRangeChange} startDate={rangeStartDate} endDate={rangeEndDate} selectsRange inline />
        </div>
        {rangeAverageData ? (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={rangeAverageData}>
              <XAxis dataKey="hour" interval={3} />
              <YAxis domain={[0, maxPlayers + mapsHeight]} ticks={[0, 20, 40, 64]} />
              <Legend />
              <CartesianGrid stroke="#eee" strokeDasharray="5 5" vertical={false} />
              <Line type="monotone" strokeWidth={2} dataKey="playersMin" stroke={colors.playersMin} dot={false} />
              <Line type="monotone" strokeWidth={2} dataKey="playersAvg" stroke={colors.playersAvg} dot={false} />
              <Line type="monotone" strokeWidth={2} dataKey="playersMax" stroke={colors.playersMax} dot={false} />
              {/* <Line type="monotone" strokeWidth={2} dataKey="bots" stroke={colors.bots} dot={false} /> */}
              {/* <Line type="monotone" strokeWidth={2} dataKey="players" stroke={colors.players} dot={false} /> */}
              {/* <Line type="monotone" strokeWidth={3} dataKey="total" stroke={colors.total} dot={false} /> */}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <ReactLoading className="centered" type="bars" />
        )}
      </Section>
    </>
  );
}
