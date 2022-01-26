// (C) Copyright 2015 Moodle Pty Ltd.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { Component, OnChanges, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { IonRefresher } from '@ionic/angular';

import { CoreCourseFormatComponent } from '@features/course/components/format/format';
import { CoreCourseModuleCompletionData, CoreCourseSection } from '@features/course/services/course-helper';
import { CoreCourseFormatDelegate } from '@features/course/services/format-delegate';
import { CoreCourseAnyCourseData } from '@features/courses/services/courses';
import { CoreSitePlugins, CoreSitePluginsContent } from '@features/siteplugins/services/siteplugins';
import { CoreSitePluginsPluginContentComponent } from '../plugin-content/plugin-content';

/**
 * Component that displays the index of a course format site plugin.
 */
@Component({
    selector: 'core-site-plugins-course-format',
    templateUrl: 'core-siteplugins-course-format.html',
    styles: [':host { display: contents; }'],
})
export class CoreSitePluginsCourseFormatComponent implements OnChanges {

    @Input() course?: CoreCourseAnyCourseData; // The course to render.
    @Input() sections?: CoreCourseSection[]; // List of course sections. The status will be calculated in this component.
    @Input() downloadEnabled?: boolean; // Whether the download of sections and modules is enabled.
    @Input() initialSectionId?: number; // The section to load first (by ID).
    @Input() initialSectionNumber?: number; // The section to load first (by number).
    @Input() moduleId?: number; // The module ID to scroll to. Must be inside the initial selected section.
    @Output() completionChanged = new EventEmitter<CoreCourseModuleCompletionData>(); // Notify when any module completion changes.

    // Special input, allows access to the parent instance properties and methods.
    // Please notice that all the other inputs/outputs are also accessible through this instance, so they could be removed.
    // However, we decided to keep them to support ngOnChanges and to make templates easier to read.
    @Input() coreCourseFormatComponent?: CoreCourseFormatComponent;

    @ViewChild(CoreSitePluginsPluginContentComponent) content?: CoreSitePluginsPluginContentComponent;

    component?: string;
    method?: string;
    args?: Record<string, unknown>;
    initResult?: CoreSitePluginsContent | null;
    data?: Record<string, unknown>;

    /**
     * Detect changes on input properties.
     */
    ngOnChanges(): void {
        if (!this.course || !this.course.format) {
            return;
        }

        if (!this.component) {
            // Initialize the data.
            const handlerName = CoreCourseFormatDelegate.getHandlerName(this.course.format);
            const handler = CoreSitePlugins.getSitePluginHandler(handlerName);

            if (handler) {
                this.component = handler.plugin.component;
                this.method = handler.handlerSchema.method;
                this.args = {
                    courseid: this.course.id,
                    downloadenabled: this.downloadEnabled,
                };
                this.initResult = handler.initResult;
            }
        }

        // Pass input data to the component.
        this.data = {
            course: this.course,
            sections: this.sections,
            downloadEnabled: this.downloadEnabled,
            initialSectionId: this.initialSectionId,
            initialSectionNumber: this.initialSectionNumber,
            moduleId: this.moduleId,
            completionChanged: this.completionChanged,
            coreCourseFormatComponent: this.coreCourseFormatComponent,
        };
    }

    /**
     * Refresh the data.
     *
     * @param refresher Refresher.
     * @param done Function to call when done.
     * @param afterCompletionChange Whether the refresh is due to a completion change.
     * @return Promise resolved when done.
     */
    async doRefresh(refresher?: IonRefresher, done?: () => void, afterCompletionChange?: boolean): Promise<void> {
        await this.content?.refreshContent(afterCompletionChange);
    }

}
