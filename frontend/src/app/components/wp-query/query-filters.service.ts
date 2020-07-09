import {Injectable} from "@angular/core";
import {QueryFormResource} from "core-app/modules/hal/resources/query-form-resource";
import {QueryFilterInstanceSchemaResource} from "core-app/modules/hal/resources/query-filter-instance-schema-resource";
import {QueryResource} from "core-app/modules/hal/resources/query-resource";
import {QueryFilterInstanceResource} from "core-app/modules/hal/resources/query-filter-instance-resource";
import {SchemaCacheService} from "core-components/schemas/schema-cache.service";

@Injectable()
export class QueryFiltersService {
  constructor(protected schemaCache:SchemaCacheService) {
  }

  /**
   * Get the matching schema of the filter resource
   * from the schema
   */
  private getFilterSchema(filter:QueryFilterInstanceResource, form:QueryFormResource):QueryFilterInstanceSchemaResource|undefined {
    const available = form.$embedded.schema.filtersSchemas.elements;
    return _.find(available, schema => schema.allowedFilterValue.href === filter.filter.href);
  }

  /**
   * Prepares the schemas of each filter to be readily placed to make alterations
   * to the filter based on the filter e.g. when sending an updated filter to the backend.
   * @param query
   * @param form
   */
  public mapSchemasIntoFilters(query:QueryResource, form:QueryFormResource) {
    query.filters.forEach(filter => {
      let schema = this.getFilterSchema(filter, form)!;
      filter.$links.schema = schema.$links.self;
      this.schemaCache.update(filter, schema);
    });
  }
}
