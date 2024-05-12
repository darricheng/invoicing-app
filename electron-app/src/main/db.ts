import { IpcMainInvokeEvent } from 'electron';
import {
  Customer,
  FullCustomerForm,
  FullCustomerWithLineItems,
  LineItem,
  LineItemForm,
} from './types';
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
export async function closeDb() {
  await sequelize.close();
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _e: IpcMainInvokeEvent,
  id: number
): Promise<[Customer, Array<LineItem>]> {
  const data = await sequelize.models.Customer.findByPk(id, { include: sequelize.models.LineItem });
  const customer = data?.dataValues;
  delete customer.createdAt;
  delete customer.updatedAt;
  const line_items = customer.LineItems.map((el: Model<any, any>) => {
    const item = el.dataValues;
    delete item.createdAt;
    delete item.updatedAt;
    return item;
  });
  return [customer, line_items];
}
export async function addCustomer(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _e: IpcMainInvokeEvent,
  data: FullCustomerForm
): Promise<[number, number]> /* [customer_id, number_of_line_items] */ {
  const customer = data.customer;
  // supposedly, it should be possible to create the customer with their line items in one function call
  // see: https://sequelize.org/docs/v6/advanced-association-concepts/creating-with-associations/
  // but I couldn't get is to work
  const customerRes = await sequelize.models.Customer.create({
    ...customer,
  });
  const customerId = customerRes.dataValues.id;
  const lineItems = data.line_items.map((el) => {
    return {
      ...el,
      CustomerId: customerId,
    };
  });
  const lineItemsRes = await sequelize.models.LineItem.bulkCreate([...lineItems]);
  return [customerRes.dataValues.id, lineItemsRes.length];
}
export async function editCustomer(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _e: IpcMainInvokeEvent,
  data: FullCustomerForm
): Promise<[number, number]> {
  const customerToEdit = data.customer;
  const lineItemsToEdit = data.line_items;

  const [customerRowsEdited] = await sequelize.models.Customer.update(customerToEdit, {
    where: { id: customerToEdit.id },
  });

  // get items from db, filter for new, changed, and deleted items, then execute queries accordingly
  const [newLineItems, updatedLineItems] = lineItemsToEdit.reduce<
    [Array<LineItemForm>, Array<LineItemForm>]
  >(
    (acc, el) => {
      acc[el.id ? 1 : 0].push(el);
      return acc;
    },
    [[], []]
  );
  const existingLineItems = await sequelize.models.LineItem.findAll({
    where: { CustomerId: customerToEdit.id },
    attributes: { include: ['id'] },
  });
  const existingLineItemIds = existingLineItems.map((el) => {
    return el.dataValues.id;
  });
  const updatedLineItemIds = updatedLineItems.map((el) => {
    return el.id;
  });
  const deletedLineItemIds = existingLineItemIds.filter((el) => {
    return updatedLineItemIds.indexOf(el) === -1;
  });

  let lineItemRowsUpdated = 0;

  // Updates
  // will also run for unchanged items
  for (const item of updatedLineItems) {
    const [num] = await sequelize.models.LineItem.update(item, { where: { id: item.id } });
    lineItemRowsUpdated += num;
  }
  // Adds
  const lineItemsToAdd = newLineItems.map((el) => {
    return {
      ...el,
      CustomerId: customerToEdit.id,
    };
  });
  const addedRes = await sequelize.models.LineItem.bulkCreate(lineItemsToAdd);
  lineItemRowsUpdated += addedRes.length;
  // Deletes
  const numItemsDeleted = await sequelize.models.LineItem.destroy({
    where: { id: deletedLineItemIds },
  });
  lineItemRowsUpdated += numItemsDeleted;

  return [customerRowsEdited, lineItemRowsUpdated];
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function deleteCustomer(_e: IpcMainInvokeEvent, id: number): Promise<number> {
  await sequelize.models.Customer.destroy({ where: { id } });
  return 1;
}
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
