import { Databases } from "../utils/Database";

export enum Permission {
  MANAGE_ACCOUNTS = 0,
  MANAGE_VIPS = 1,
  VIEW_CHATLOGS = 2,
}

export default class Role {

  public static ADMIN_ROLE_ID = 2;
  private static roles: Array<Role> = [];

  public static async getRoleById(id: number): Promise<Role> {
    let role: Role;
    if ((role = Role.roles.find((u) => u.id === id))) return role;
    const roleData = (await Databases.polygon.query(`SELECT role_id as id, role_name as name FROM polycp_roles WHERE role_id = ?`, [id]))[0] as Role;
    if (!roleData) return null;
    role = Role.from(roleData);
    this.roles.push(role);
    return role;
  }
  public static from(data: Role) {
    const role = new Role();
    role.id = data.id;
    role.name = data.name;
    return role;
  }

  public async asPermission(permission: Permission): Promise<boolean> {
    if (this.permissions == null) await this.loadPermissions();
    return this.permissions.includes(permission);
  }

  private async loadPermissions(): Promise<void> {
    const permissions = (await Databases.polygon.query(`SELECT permission_id as permissionId FROM polycp_granted_permissions WHERE role_id = ?`, [this.id])) as Array<{ permissionId: number }>;
    this.permissions = [];
    permissions.forEach((perm) => {
      this.permissions.push(perm.permissionId as Permission);
    });
  }

  public id: number;
  public name: string;
  public permissions: Array<Permission> = null;

}
