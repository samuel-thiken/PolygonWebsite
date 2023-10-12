import { useState } from "react";
import I18n, { useI18n } from "../utils/I18n";

export type GamemodeName = "ConquestLarge0" | "ConquestSmall0";
export type MapName =
  | "MP_Abandoned"
  | "MP_Damage"
  | "MP_Flooded"
  | "MP_Journey"
  | "MP_Naval"
  | "MP_Prison"
  | "MP_Resort"
  | "MP_Siege"
  | "MP_TheDish"
  | "MP_Tremors"
  | "XP0_Caspian"
  | "XP0_Firestorm"
  | "XP0_Metro"
  | "XP0_Oman"
  | "XP1_001"
  | "XP1_002"
  | "XP1_003"
  | "XP1_004"
  | "XP2_001"
  | "XP2_002"
  | "XP2_003"
  | "XP2_004"
  | "XP3_MarketPl"
  | "XP3_Prpganda"
  | "XP3_UrbanGdn"
  | "XP3_WtrFront"
  | "XP4_Arctic"
  | "XP4_SubBase"
  | "XP4_Titan"
  | "XP4_WlkrFtry"
  | "XP5_Night_01"
  | "XP6_CMP"
  | "XP7_Valley";

export enum MapStatus {
  ACTIVE = "map-active",
  DISABLED = "map-disabled",
  NONE = "",
}

export class Map {

  public name: MapName;

  constructor(name: MapName) {
    this.name = name;
  }

  public equals(map: Map): boolean {
    return this.name === map.name;
  }

}

export default function MapElement(props: { status?: MapStatus; count?: number | null; gamemode?: GamemodeName | null; map: Map, onClick?: (map: Map) => void }): React.ReactElement {
  const { getI18nText } = useI18n();

  return (
    <span className={`map`} onClick={() => props.onClick && props.status !== MapStatus.DISABLED && props.onClick(props.map)} onKeyPress={undefined} role={props.onClick && props.status !== MapStatus.DISABLED ? "button" : "group"} tabIndex={-1}>
      <img className="map-image" src={`/assets/images/maps/wide/${props.map.name.toLowerCase()}.jpg`} alt={getI18nText(`maps.${props.map.name}`)} />
      <span className={`map-status ${props.status || MapStatus.NONE}`}></span>
      <span className="map-name">
        <I18n t={`maps.${props.map.name}`} />
        {props.gamemode && (
          <span className="map-name-gamemode">
            <I18n t={`gamemodes.${props.gamemode}`} />
          </span>
        )}
      </span>
      {(props.count || props.count === 0) && <span className="map-value">{props.count}</span>}
    </span>
  );
}
