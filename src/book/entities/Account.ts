import * as v from 'class-validator';
import {
  Column,
  Entity, JoinColumn,
  ManyToOne,
  RelationId,
  Tree,
  TreeParent,
  TreeChildren,
  OneToMany,
} from 'typeorm';
import { DateTime } from 'luxon';

import type Commodity from './Commodity';
import Money from '../Money';
import type Split from './Split';
import BaseEntity from './BaseEntity';
import { isInvestment, getAllowedSubAccounts } from '../helpers/accountType';

/**
 * CREATE TABLE accounts (
 *   guid            CHAR(32) PRIMARY KEY NOT NULL,
 *   name            text(2048) NOT NULL,
 *   account_type    text(2048) NOT NULL,
 *   commodity_guid  CHAR(32) NOT NULL,
 *   commodity_scu   integer NOT NULL,
 *   non_std_scu     integer NOT NULL,
 *   parent_guid     CHAR(32),
 *   code            text(2048),
 *   description     text(2048),
 *   hidden          integer NOT NULL,
 *   placeholder     integer NOT NULL
 * );
 */

@Entity('accounts')
@Tree('nested-set')
export default class Account extends BaseEntity {
  static TYPES = ['ROOT', 'ASSET', 'BANK', 'CASH', 'EQUITY', 'LIABILITY', 'INCOME', 'EXPENSE', 'MUTUAL', 'STOCK'];

  @Column({
    type: 'text',
    length: 2048,
  })
  @v.Matches(/[a-zA-Z.]+/)
  @v.Length(4, 2048)
    name!: string;

  @Column({
    type: 'text',
    enum: Account.TYPES,
    length: 2048,
    name: 'account_type',
  })
  @CheckAccountType()
  @v.IsIn(Account.TYPES)
    type!: string;

  @Column({
    type: 'text',
    select: false,
    default: '',
  })
    path!: string;

  @TreeParent()
  @JoinColumn({ name: 'parent_guid' })
  @v.IsNotEmpty({ message: 'parent is required' })
  @v.ValidateIf(o => o.type !== 'ROOT')
  // Seems TreeParent doesn't let us create referencing the guid of the account
  // and needs the whole object...
    parent!: Account;

  @TreeChildren()
    children!: Account[];

  @RelationId((account: Account) => account.children) // you need to specify target relation
    childrenIds: string[];

  @ManyToOne('Commodity', { eager: true })
  @JoinColumn({ name: 'commodity_guid' })
  @CheckCommodity()
  @v.ValidateIf(o => o.type !== 'ROOT')
  @v.IsNotEmpty({ message: 'commodity is required' })
    fk_commodity!: Commodity | string;

  get commodity(): Commodity {
    return this.fk_commodity as Commodity;
  }

  @OneToMany('Split', (split: Split) => split.fk_account)
    splits!: Split[];

  getTotal(date?: DateTime): Money {
    if (this.type === 'ROOT') {
      // @ts-ignore
      return null;
    }

    let { splits } = this;
    if (date) {
      splits = splits.filter(split => split.transaction.date < date);
    }

    const total = splits.reduce(
      (acc, split) => acc.add(
        new Money(split.quantityNum / split.quantityDenom, this.commodity.mnemonic),
      ),
      new Money(0, this.commodity.mnemonic),
    );

    if (total.isNegative()) {
      return total.multiply(-1);
    }

    return total;
  }
}

// https://github.com/typeorm/typeorm/issues/4714
Object.defineProperty(Account, 'name', { value: 'Account' });

/**
 * Checks allowed types for parent account given the current account's type
 */
function CheckAccountType(validationOptions?: v.ValidationOptions) {
  return function f(object: Account, propertyName: string) {
    v.registerDecorator({
      name: 'checkAccountType',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(type: string, args: v.ValidationArguments) {
          const account = args.object as Account;
          if (account.parent) {
            return getAllowedSubAccounts(account.parent.type).includes(type);
          }

          return true;
        },

        defaultMessage(args: v.ValidationArguments) {
          const account = args.object as Account;
          const allowedTypes = getAllowedSubAccounts(account.parent.type);

          return `only ${allowedTypes} types can be selected with ${account.parent.type} account as parent`;
        },
      },
    });
  };
}

/**
 * Checks that investment accounts commodity is not a currency
 */
function CheckCommodity(validationOptions?: v.ValidationOptions) {
  return function f(object: Account, propertyName: string) {
    v.registerDecorator({
      name: 'checkCommodity',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(fk_commodity: Commodity, args: v.ValidationArguments) {
          const account = args.object as Account;
          if (isInvestment(account)) {
            return fk_commodity.namespace !== 'CURRENCY';
          }

          return true;
        },

        defaultMessage() {
          return 'investment accounts cant have a currency as their commodity';
        },
      },
    });
  };
}
