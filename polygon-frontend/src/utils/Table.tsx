import React, { useContext, useEffect, useState } from "react";
import moment from "moment";
import DatePicker, { ReactDatePickerCustomHeaderProps, registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useI18n } from "./I18n";

type CellBuilderProps = {
  value: any;
  onChange: (newValue: any) => void;
};
export enum ChangeType {
  INSERT,
  UPDATE,
  DELETE,
}
export type Change = {
  rowId: any;
  type: ChangeType;
  changes: {
    [key: string]: any;
  };
};

const TableContext = React.createContext<{
  addColumn:(field: string, cons: (props: CellBuilderProps) => React.ReactElement) => void;
}>({
  addColumn: () => null
});
const TableContextProvider = (props: { children: React.ReactNode; addColumn: (field: string, cons: (props: CellBuilderProps) => React.ReactElement) => void }): React.ReactElement => <TableContext.Provider value={{ addColumn: props.addColumn }}>{props.children}</TableContext.Provider>;

export enum ColumnType {
  STRING,
  DATE,
  BOOLEAN,
  ENUM,
  CUSTOM,
}
type ColumnTypeData = { type: ColumnType.STRING } | { type: ColumnType.CUSTOM; component: (propsCell: CellBuilderProps) => React.ReactElement } | { type: ColumnType.DATE } | { type: ColumnType.BOOLEAN } | { type: ColumnType.ENUM; enum: { [key: number]: string }; colors?: { [key: number]: string } };

const CellReading = (props: CellBuilderProps & ColumnTypeData): React.ReactElement => {
  const value = props.value;
  switch (props.type) {
    case ColumnType.CUSTOM:
      return props.component(props);
    case ColumnType.STRING:
      return <>{value}</>;
    case ColumnType.BOOLEAN:
      return <input type="checkbox" disabled value={value} />;
    case ColumnType.DATE:
      return <>{moment(value).format("L")}</>;
    case ColumnType.ENUM:
      return <span className={`badge ${props.colors ? props.colors[value] : ""}`}>{props.enum[value].toUpperCase()}</span>;
    default:
      return <>{value}</>;
  }
};
const CellEditing = (props: CellBuilderProps & ColumnTypeData & { className?: string }): React.ReactElement => {
  const CustomDatePickerHeader = ({ date, decreaseMonth, increaseMonth }: ReactDatePickerCustomHeaderProps) => (
    <>
      <div style={{ display: "flex" }}>
        {[7, 14, 30, 90, 180, 365].map((count, i) => (
          <button key={i} className="btn-no-btn badge grey" onClick={() => props.onChange(moment(props.value).add(count, "days").toDate())}>
            +{count}
          </button>
        ))}
      </div>
      <div style={{ position: "relative" }}>
        <button type="button" onClick={decreaseMonth} className="react-datepicker__navigation react-datepicker__navigation--previous" aria-label="Previous Month">
          <span className="react-datepicker__navigation-icon react-datepicker__navigation-icon--previous">Previous Month</span>
        </button>
        <div className="react-datepicker__current-month">
          {moment(date).format("MMMM")} {moment(date).year()}
        </div>
        <button type="button" onClick={increaseMonth} className="react-datepicker__navigation react-datepicker__navigation--next" aria-label="Next Month">
          <span className="react-datepicker__navigation-icon react-datepicker__navigation-icon--next">Next Month</span>
        </button>
      </div>
    </>
  );

  const { locale } = useI18n();

  switch (props.type) {
    case ColumnType.CUSTOM:
      return props.component({ ...props, onChange: props.onChange });
    case ColumnType.STRING:
      return <input className={props.className} type="text" value={props.value} onChange={(event) => props.onChange(event.target.value)} />;
    case ColumnType.BOOLEAN:
      return <input className={props.className} type="checkbox" value={props.value} onChange={(event) => props.onChange(event.target.value)} />;
    case ColumnType.DATE:
      return <DatePicker className={props.className} dateFormat={locale == "fr" ? "dd/MM/yyyy" : "MM/dd/yyyy"} closeOnScroll renderCustomHeader={CustomDatePickerHeader} selected={new Date(props.value)} onChange={props.onChange} />;
    case ColumnType.ENUM:
      return (
        <select value={props.value} className={`badge ${props.colors ? props.colors[props.value] : ""} ${props.className}`} onChange={(event) => props.onChange(parseInt(event.target.value))}>
          {Object.values(props.enum)
            .filter((v) => Number.isInteger(v))
            .map((e, i) => (
              <option key={i} className={`badge ${props.colors ? props.colors[parseInt(e)] : ""}`} value={e}>
                {props.enum[parseInt(e)].toUpperCase()}
              </option>
            ))}
        </select>
      );
    default:
      return <>Error</>;
  }
};
const CellContainer = (props: CellBuilderProps & ColumnTypeData & { editable?: boolean }): React.ReactElement => <span className={`cell-content`}>{props.editable ? <CellEditing {...props} onChange={props.onChange} value={props.value} /> : <CellReading {...props} value={props.value} />}</span>;

export const Column = (props: ColumnTypeData & { name: string | React.ReactElement; field: string; editable?: boolean }): React.ReactElement => {
  const { addColumn } = useContext(TableContext);

  const cellContructor = (propsCell: CellBuilderProps): React.ReactElement => <CellContainer {...propsCell} {...props} />;

  useEffect(() => {
    addColumn(props.field, cellContructor);
  }, []);

  return <th>{props.name}</th>;
};

const Table = <C extends string, T extends { [key in C]: any }>(props: { children: React.ReactNode; data: Array<T>; idField: C; setData: (data: Array<T>) => void; createRow: () => T }): React.ReactElement => {
  const [columns, setColumns] = useState<Array<{ position: number; field: C; builder:(props: CellBuilderProps) => React.ReactElement }>>([]);

  const addColumn = (field: string, cons: (props: CellBuilderProps) => React.ReactElement): void => {
    const existing = columns.find((c) => c.field === field);
    if (existing) columns.splice(columns.indexOf(existing), 1);
    columns.push({
      position: columns.length,
      field: field as C,
      builder: cons
    });
    setColumns([...columns]);
  };

  const triggerRowChanged = (rowId: any, columnField: C, newValue: any) => {
    const row = props.data.find((r) => r[props.idField] === rowId);
    if (!row) return;
    row[columnField] = newValue;

    props.setData([...props.data.filter((d) => d[props.idField] !== rowId), row]);
  };

  const addRow = () => {
    const row: T = props.createRow();
    props.setData([row, ...props.data]);
  };

  const removeRow = (rowId: any) => {
    props.setData([...props.data.filter((d) => d[props.idField] !== rowId)]);
  };

  return (
    <TableContextProvider addColumn={addColumn}>
      <div className="table-container">
        <button className="add-row small bf-btn" style={{ padding: "0 8px" }} onClick={addRow}>
          +
        </button>
        <table className="table w-100">
          <thead>
            <tr>{props.children}</tr>
          </thead>
          <tbody>
            {props.data
              .sort((a, b) => a[props.idField] - b[props.idField])
              .map((row) => (
                <tr key={row[props.idField]} className={`row`}>
                  {columns.map((column) => (
                    <td key={column.field}>{column.builder({ value: row[column.field], onChange: (newValue: any) => triggerRowChanged(row[props.idField], column.field, newValue) })}</td>
                  ))}
                  <td style={{ width: 0, minWidth: 0 }}>
                    <button className="delete-row small bf-btn" style={{ padding: "0 8px" }} onClick={() => removeRow(row[props.idField])}>
                      🗑
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </TableContextProvider>
  );
};

export default Table;
