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

import {Injectable} from "@angular/core";
import {HttpClient, HttpEvent, HttpEventType, HttpResponse} from "@angular/common/http";
import {HalResource} from "core-app/modules/hal/resources/hal-resource";
import {Observable, of, from} from "rxjs";
import {filter, map, share, switchMap, mergeMap} from "rxjs/operators";
import {HalResourceService} from "core-app/modules/hal/services/hal-resource.service";
import { UploadFile, UploadResult, MappedUploadResult, UploadInProgress, OpenProjectFileUploadService, UploadBlob } from './op-file-upload.service';

@Injectable()
export class OpenProjectDirectFileUploadService extends OpenProjectFileUploadService {
  /**
   * Upload a single file, get an UploadResult observable
   * @param {string} url
   * @param {UploadFile} file
   * @param {string} method
   */
  public uploadSingle(url:string, file:UploadFile|UploadBlob, method:string = 'post', responseType:'text'|'json' = 'json') {
    const observable = from(this.getDirectUploadFormFrom(url, file))
      .pipe(
        switchMap(this.uploadToExternal(file, method, responseType)),
        share()
      );

    return [file, observable] as UploadInProgress;
  }

  private uploadToExternal(file: UploadFile | UploadBlob, method: string, responseType: string): (value: { url: string; form: FormData; response: Object; }, index: number) => Observable<HttpEvent<HalResource>> {
    return result => {
      result.form.append('file', file, file.customName || file.name);

      return this
        .http
        .request<HalResource>(
          method,
          result.url,
          {
            body: result.form,
            // Observe the response, not the body
            observe: 'events',
            // This is important as the CORS policy for the bucket is * and you can't use credentals then,
            // besides we don't need them here anyway.
            withCredentials: false,
            responseType: responseType as any,
            // Subscribe to progress events. subscribe() will fire multiple times!
            reportProgress: true
          }
        )
        .pipe(switchMap(this.finishUpload()));
    };
  }

  private finishUpload(): (value: { url: string; form: FormData; response: Object; }, index: number) => Observable<HttpEvent<HalResource>> {
    return result => {
      if ()
    };
  }

  public getDirectUploadFormFrom(url:string, file:UploadFile|UploadBlob):Promise<{url:string,form:FormData,response:Object}> {
    const formData = new FormData();
    const metadata = {
      description: file.description,
      fileName: file.customName || file.name
    };

    // add the metadata object
    formData.append(
      'metadata',
      JSON.stringify(metadata),
    );

    const result = this
      .http
      .request<HalResource>(
        "post",
        url,
        {
          body: formData,
          withCredentials: true,
          responseType: "json" as any
        }
      )
      .toPromise()
      .then((res) => {
        let form = new FormData();

        _.each(res._links.addAttachment.form_fields, (value, key) => {
          form.append(key, value);
        });

        return { url: res._links.addAttachment.href, form: form, response: res };
      })
      .catch((err) => {
        debugger;
        console.log(err);

        return new FormData();
      });

    return result;
  }
}
