import { useContext, useEffect, useState } from "react";
import Section from "../../partials/Section";
import I18n from "../../utils/I18n";
import superagent from "superagent";
import { AuthContext } from "../../utils/Authentication";
import Table, { Column, ColumnType } from "../../utils/Table";
import ReactLoading from "react-loading";

type Vip = {
  id: number;
  player: string;
  expiresAt: Date;
  status: VipStatus;
};
enum VipStatus {
  ACTIVE = 0,
  INACTIVE = 1,
  EXPIRED = 2,
}

export default function Vips(): React.ReactElement {
  const [savedVips, setSavedVips] = useState<Array<Vip>>([]);
  const [vips, setVips] = useState<Array<Vip>>([]);
  const [saving, setSaving] = useState(false);

  const { token } = useContext(AuthContext);

  useEffect(() => {
    superagent
      .get(`${process.env.REACT_APP_API_SERVER}/users/vips`)
      .set({ "x-access-token": token })
      .send()
      .then((result) => {
        if (result) {
          setSavedVips((result.body as Vip[]).map((vip) => ({ id: vip.id, expiresAt: vip.expiresAt, player: vip.player, status: vip.status })));
          setVips(result.body);
        }
      })
      .catch(() => {
        // catch error
      });
  }, []);

  const createRow = (): Vip => {
    let id: any;
    do id = Math.floor(Math.random() * 1000);
    while (vips.find((v) => v.id === id));

    return {
      id: id,
      expiresAt: new Date(),
      player: "New player",
      status: VipStatus.ACTIVE
    };
  };

  const updateVip = async (vip: Vip): Promise<void> => {
    // console.log("Updating", vip);
    await superagent.post(`${process.env.REACT_APP_API_SERVER}/users/vips/update`).set({ "x-access-token": token }).send(vip);
  };
  const createVip = async (vip: Vip): Promise<void> => {
    // console.log("Creating", vip);
    const result = await superagent.post(`${process.env.REACT_APP_API_SERVER}/users/vips/create`).set({ "x-access-token": token }).send(vip);
    vip.id = result.body.id;
  };
  const deleteVip = async (vip: Vip): Promise<void> => {
    // console.log("Deleting", vip);
    await superagent.post(`${process.env.REACT_APP_API_SERVER}/users/vips/delete`).set({ "x-access-token": token }).send(vip);
  };

  const save = async () => {
    setSaving(true);
    for (const vip of vips) {
      const savedVersion = savedVips.find((v) => v.id === vip.id);
      if (!savedVersion) {
        // Create
        await createVip(vip);
      } else {
        // Update
        for (const k of Object.keys(vip)) {
          const key = k as keyof Vip;
          if (Object.hasOwn(vip, key) && Object.hasOwn(savedVersion, key) && vip[key] !== savedVersion[key]) {
            await updateVip(vip);
            break;
          }
        }
      }
    }
    for (const savedVip of savedVips) {
      const vip = vips.find((v) => v.id === savedVip.id);
      if (!vip) {
        // Delete
        await deleteVip(savedVip);
      }
    }
    setSavedVips(vips.map((vip) => ({ id: vip.id, expiresAt: vip.expiresAt, player: vip.player, status: vip.status })));
    setSaving(false);
  };

  return (
    <>
      <Section type="primary">
        <div className="m-5">
          <p className="title">Vip Manage</p>
          <p className="subtitle">
            <I18n t="stats.subtitle" />
          </p>
        </div>
        <div className="mt-5">
          <p>Here you can manage the server's vips</p>
        </div>
      </Section>
      <Section contentClassName="overflow-auto">
        {saving ? (
          <ReactLoading className="centered" type="bars" />
        ) : (
          <button onClick={save} className="small bf-btn">SAVE</button>
        )}
        <Table data={vips} setData={setVips} idField="id" createRow={createRow}>
          <Column name="Player" field="player" type={ColumnType.STRING} editable />
          <Column name="Expires at" field="expiresAt" type={ColumnType.DATE} editable />
          <Column name="Status" field="status" enum={VipStatus} type={ColumnType.ENUM} editable colors={{ [VipStatus.ACTIVE]: "green", [VipStatus.INACTIVE]: "red", [VipStatus.EXPIRED]: "orange" }} />
        </Table>
      </Section>
    </>
  );
}
