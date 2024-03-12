import { IpcMainInvokeEvent } from 'electron';
import { Customer, FullCustomerForm, FullCustomerWithLineItems, LineItem } from './types';
import { DataTypes, Sequelize } from 'sequelize';
import { is } from '@electron-toolkit/utils';
import { Model } from 'sequelize';

// function signatures should match the types in the main/types.ts file
// with the addition of the IpcMainInvokeEvent argument

let sequelize: Sequelize;

export async function initDb(path: string) {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path,
  });

  // define tables
  const Customer = sequelize.define(
    'Customer',
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
    },
    {
      tableName: 'Customers',
    }
  );
  const LineItem = sequelize.define(
    'LineItem',
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      rate: {
        type: DataTypes.REAL,
        allowNull: false,
      },
      details: {
        type: DataTypes.STRING,
      },
    },
    {
      tableName: 'LineItems',
    }
  );
  // create associations
  Customer.hasMany(LineItem, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
  LineItem.belongsTo(Customer);
  // sync with db
  if (is.dev) {
    await sequelize.sync({ alter: { drop: false } });
  } else {
    await sequelize.sync();
  }
}
export async function testDb() {
  // try {
  //   await sequelize.authenticate();
  //   console.log('Connection has been established successfully.');
  // } catch (error) {
  //   console.error('Unable to connect to the database:', error);
  // }
}
export function closeDb() {
  sequelize.close();
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function listCustomers(_e: IpcMainInvokeEvent): Promise<Array<Customer>> {
  const data = await sequelize.models.Customer.findAll();
  const customers = data.map((el) => {
    const customer = el.dataValues;
    delete customer.createdAt;
    delete customer.updatedAt;
    return customer;
  });
  return customers;
}
export async function getCustomer(
  _e: IpcMainInvokeEvent,
  id: number
): Promise<[Customer, Array<LineItem>]> {}
export async function addCustomer(
  _e: IpcMainInvokeEvent,
  data: FullCustomerForm
): Promise<[number, number]> {}
export async function editCustomer(
  _e: IpcMainInvokeEvent,
  data: FullCustomerForm
): Promise<[number, number]> {}
export async function deleteCustomer(_e: IpcMainInvokeEvent, id: number): Promise<number> {}
export async function getEverything(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _e: IpcMainInvokeEvent
): Promise<Array<FullCustomerWithLineItems>> {
  const data = await sequelize.models.Customer.findAll({ include: sequelize.models.LineItem });
  return data.map((el) => {
    const customer = el.dataValues;
    delete customer.createdAt;
    delete customer.updatedAt;
    const line_items = customer.LineItems.map((el: Model<any, any>) => {
      const item = el.dataValues;
      delete item.createdAt;
      delete item.updatedAt;
      return item;
    });
    delete customer.LineItems;
    return {
      customer,
      line_items,
    };
  });
}
