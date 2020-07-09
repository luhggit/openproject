//-- copyright
// OpenProject is an open source project management software.
// Copyright (C) 2012-2020 the OpenProject GmbH
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License version 3.
//
// OpenProject is a fork of ChiliProject, which is a fork of Redmine. The copyright follows:
// Copyright (C) 2006-2013 Jean-Philippe Lang
// Copyright (C) 2010-2013 the ChiliProject Team
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License
// as published by the Free Software Foundation; either version 2
// of the License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
//
// See docs/COPYRIGHT.rdoc for more details.
//++

import {IFieldSchema} from "core-app/modules/fields/field.base";
import {SchemaProxy} from "core-app/modules/hal/schemas/schema-proxy";

export class WorkPackageSchemaProxy extends SchemaProxy {
  //static create(schema:SchemaResource) {
  //  return new Proxy(
  //    schema,
  //    new WorkPackageSchemaResource(schema)
  //  ) as SchemaResource;
  //}

  //get(schema:SchemaResource, property:PropertyKey, receiver:any):any {
  //  if (property === 'ofProperty') {
  //    let self = this;

  //    // Returing a Proxy again here so that the call is bound
  //    // to the WorkPackageSchemaResource instance.
  //    return new Proxy(this.ofProperty, {
  //      apply: function(_, __, argumentsList) {
  //        return self.ofProperty(argumentsList[0]);
  //      }});
  //  }

  //  return Reflect.get(schema, property, receiver);
  //}

  /**
   * Returns the part of the schema relevant for the provided property.
   *
   * We use it to support the virtual attribute 'combinedDate' which is the combination of the three
   * attributes 'startDate', 'dueDate' and 'scheduleManually'. That combination exists only in the front end
   * and not on the native schema. As a property needs to be writable for us to allow the user editing,
   * we need to mark the writability positively if any of the combined properties are writable.
   *
   * @param property the schema part is desired for
   */
  public ofProperty(property:string) {
    let propertySchema:IFieldSchema;

    if (property === 'combinedDate') {
      propertySchema = Object.assign({},
        this.schema['startDate'],
        { writable: this.schema['startDate'].writable ||
            this.schema['dueDate'].writable ||
            this.schema['scheduleManually'].writable });
    } else if (this.isMilestone && (property === 'startDate' || property === 'dueDate')) {
      propertySchema = super.ofProperty('date');
    } else {
      propertySchema = super.ofProperty(property);
    }

    return propertySchema;
  }

  /**
   * Return whether the work package is editable with the user's permission
   * on the given work package attribute.
   *
   * @param property
   */
  public isAttributeEditable(property:string):boolean {
    return super.isAttributeEditable(property) &&
      (!this.schema.isReadonly || property === 'status');
  }

  public get isMilestone():boolean {
    return this.hasOwnProperty('date');
  }
}
