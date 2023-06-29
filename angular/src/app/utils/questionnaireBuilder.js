/*
* NOTE: questionnaireBuilder.ts and modal-questionnaire-viewer.component.style
* derived from source provided written by Rapid Developers and provided to us on 2022.11.02
* We are using this code provide a quick prototype of questionnaire viewers using existing code.
* This code is dependent on jquery, which is not used anywhere else in Hazmapper's codebase.
*
* Do not to utilize this code within hazmapper, we take the following approach:
*
* 1. modal-questionnaire-viewer.component.ts imports the questionnaireBuilder.ts file and jquery and renders it.
* 2. There have been some modifications to questionnaireBuilder.ts file to adapt to typescript errors.
* 3. modal-questionnaire-viewer.component.styl utilizes ng-deep to expose css beyond the scope of the component.
*    Thus, in the mean time, one has to take caution in utilizing those keywords when choosing style class/ids.
*
* Some possible TODOs in maintaining and improving this feature are:
*
* 1. Isolate the css to the independent component.
* 2. Update the js as the Rapid developers seem to modify code either
*    by requesting the team or
*    by accessing https://rapid.apl.uw.edu/rapp/ and retreiving the code as the code is not minimized.
*/

import * as $ from 'jquery';
import * as uuidv4 from 'uuid/v4';
import * as L from 'leaflet';

/** DOM creation helper library
 * This is very basic library that is effectively a wrapper around 'document.createElement'
 *
 * **/

function SVG() {}
// icons
SVG.getCloseOutIcon = function() {

    return "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\" class='buttonRemoveFile'>" +
        '<polygon points="12,0 50,38 88,0 100,12 62,50 100,88 88,100 50,62 12,100 0,88 38,50 0,12"></polygon>' +
        '</svg>';
};
SVG.getBlackCloseOutIcon = function() {

    return "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\" class='deleteItemIcon'>" +
        '<polygon points="12,0 50,38 88,0 100,12 62,50 100,88 88,100 50,62 12,100 0,88 38,50 0,12"></polygon>' +
        '</svg>';
};
SVG.getRedCloseOutIcon = function() {

    return "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\" class='buttonDeleteSubQuestionIcon'>" +
        '<polygon points="12,0 50,38 88,0 100,12 62,50 100,88 88,100 50,62 12,100 0,88 38,50 0,12"></polygon>' +
        '</svg>';
};
SVG.getGreyCloseOutIcon = function() {
    return "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\" class='branch-tooltip-close-icon'>" +
        '<polygon points="12,0 50,38 88,0 100,12 62,50 100,88 88,100 50,62 12,100 0,88 38,50 0,12"></polygon>' +
        '</svg>';
};
SVG.getDisabledCloseOutIcon = function() {

    return "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\" class='buttonRemoveFileDisabled'>" +
        '<polygon points="12,0 50,38 88,0 100,12 62,50 100,88 88,100 50,62 12,100 0,88 38,50 0,12"></polygon>' +
        '</svg>';
};

SVG.getMoveItemsIcon = function() {

    return '<svg class=testSVG xlmns="http://www.w3.org/2000/svg" ' + 'viewbox="0 0 100 100">' +
        '<polygon points="0,12 100,12 100,28 0,28"></polygon>' +
        '<polygon points="0,42 100,42 100,58 0,58"></polygon>' +
        '<polygon points="0,72 100,72 100,88 0,88"></polygon>' +
        '</svg>';
};
SVG.getMoveQuestionnaireItemsIcon = function() {

    return '<svg class=fillBlack xlmns="http://www.w3.org/2000/svg" ' + 'viewbox="0 0 100 100">' +
        '<polygon points="0,12 100,12 100,28 0,28"></polygon>' +
        '<polygon points="0,42 100,42 100,58 0,58"></polygon>' +
        '<polygon points="0,72 100,72 100,88 0,88"></polygon>' +
        '</svg>';

};

// generic icons
SVG.getPencil = function() {

    return "<svg xmlns='http://www.w3.org/2000/svg' version='1.1'  viewBox='0 0 72.7 72.7' class='sectionEditButtonSvg'>" +
        "\t<path d='M45.1,12.4l14.6,14.7L22.7,64.3L8.1,49.6L45.1,12.4z M70.9,8.8l-6.5-6.6c-2.5-2.5-6.6-2.5-9.2,0l-6.3,6.3l14.6,14.7 " +
        "l7.3-7.3C72.8,14,72.8,10.8,70.9,8.8z M0.4,70.3c-0.3,1.2,0.8,2.3,2,2l16.3-4L4.1,53.6L0.4,70.3z'/>" +
        '</svg>';
};
SVG.getPencilSmall = function() {

    return "<svg xmlns='http://www.w3.org/2000/svg' version='1.1'  viewBox='0 0 72.7 72.7' class='button-edit-question-icon'>" +
        "\t<path d='M45.1,12.4l14.6,14.7L22.7,64.3L8.1,49.6L45.1,12.4z M70.9,8.8l-6.5-6.6c-2.5-2.5-6.6-2.5-9.2,0l-6.3,6.3l14.6,14.7 " +
        "l7.3-7.3C72.8,14,72.8,10.8,70.9,8.8z M0.4,70.3c-0.3,1.2,0.8,2.3,2,2l16.3-4L4.1,53.6L0.4,70.3z'/>" +
        '</svg>';
};
SVG.getEyeIcon = function() {

    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="sectionEditButtonSvg">\n' +
        '<path d="M15 12c0 1.654-1.346 3-3 3s-3-1.346-3-3 1.346-3 3-3 3 1.346 3 3zm9-.449s-4.252 8.449-11.985 8.449c-7.18 0-12.015-8.449-12.015-8.449s4.446-7.551 12.015-7.551c7.694 0 11.985 7.551 11.985 7.551zm-7 .449c0-2.757-2.243-5-5-5s-5 2.243-5 5 2.243 5 5 5 5-2.243 5-5z"/>\n' +
        '</svg>';

};


SVG.getPdfIcon = function() {

    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 648 648" class="headerIcon"> \n' +
        '<path d="M154.72,395.47V266.35h48.7q12.87,0,19.65,1.23a39,39,0,0,1,15.94,6,31.78,31.78,0,0,1,10.35,12.47,39.56,39.56,0,0,1,3.92,17.61q0,16.47-10.49,27.88T204.92,343H171.81v52.5Zm17.09-67.73h33.38q16.55,0' +
        ',23.51-6.17t7-17.35a23.33,23.33,0,0,0-4.1-13.87,19.1,19.1,0,0,0-10.78-7.62q-4.32-1.14-15.95-1.15h-33Z"/>\n' +
        '<path d="M275,395.47V266.35h44.48q15.06,0,23,1.85a43.61,43.61,0,0,1,18.93,9.25,52.41,52.41,0,0,1,15.28,22.06q5.07,13.42,5.07,30.69a90.13,90.13,0,0,1-3.44,26.07,63.36,63.36,0,0,1-8.8,18.81,47.09,47.09,0' +
        ',0,1-11.76,11.71,47.75,47.75,0,0,1-15.42,6.47,87.82,87.82,0,0,1-20.74,2.21Zm17.09-15.24h27.56q12.78,0,20-2.38a28.58,28.58,0,0,0,11.58-6.69q6.09-6.07,9.47-16.34t3.39-24.88q0-20.26-6.65-31.14t-16.16-14.57q-6.87-2.64-22.11-2.65H292.12Z"/>\n' +
        '<path d="M406.17,395.47V266.35h87.11v15.23h-70v40h60.6v15.24h-60.6v58.66Z"/>\n' +
        '<polygon points="324 646.4 430.37 540.05 366.75 540.05 366.72 438.35 281.25 438.35 281.25 540.05 217.63 540.05 324 646.4"/>\n' +
        '<path d="M381.87,21H89.06V621.4H221.23V595H115.28V47.41H362.65V216.84H532.08V595H426.77V621.4H558.94V197.63Zm7.84,169.43V69.81L511.62,190.43Z"/>\n' +
        '</svg>';
};
SVG.getDownloadFileIcon = function() {

    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 648 648" class="sectionEditButtonSvg"> ' +
        '<polygon points="324 646.4 430.37 540.05 366.75 540.05 366.72 438.35 281.25 438.35 281.25 540.05 217.63 540.05 324 646.4"/>' +
        '<path d="M381.87,21H89.06V621.4H221.23V595H115.28V47.41H362.65V216.84H532.08V595H426.77V621.4H558.94V197.63Zm7.84,169.43V69.81L511.62,190.43Z"/>' +
        '</svg>';
};

SVG.getTrashcan = function() {

    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 188.4 248.2" class="sectionEditButtonSvg"> ' +
        "<path d='M10.2,39.6c-3,0-5.7,0.1-8.3-0.1c-0.7,0-1.8-1-1.8-1.6c-0.2-2.6-0.1-5.1-0.1-8c16.6,0,32.9,0,49.7,0c0-3.7,0-7.1,0-10.5 " +
        'C49.9,10.3,56,2.7,65,0.6C66.8,0.2,68.6,0,70.5,0c16,0,32-0.1,48,0c10.1,0,18.1,6.3,19.9,15.9c0.6,3.4,0.3,7,0.4,10.5 c0,1.1,0,2.1,0' +
        ',3.4c16.7,0,33.1,0,49.6,0c0,3.3,0,6.3,0,9.7c-3.1,0-6.3,0-9.6,0c-0.2,2.9-0.4,5.6-0.6,8.2 c-1.2,24.3-2.4,48.6-3.7,72.9c-1.4,27.2-2.9,54.4-4.3,81.6c-0.5,9.4-0.7,' +
        '18.8-1.5,28.2c-1,10.5-9.3,17.8-20,17.8 c-22.1,0-44.2,0-66.2,0c-13.8,0-27.7,0-41.5,0c-12.2,0-20.3-8-20.8-20.1c-1-20.4-2.2-40.8-3.3-61.1c-0.9-17.4-1.8-34.8-2.7-52.2 c-1.1-20.5-2.2-41.1-3.3-61.6C10.7,48.' +
        '8,10.5,44.4,10.2,39.6z M20.1,39.8c0,1,0,1.8,0,2.6c0.9,17.5,1.8,34.9,2.7,52.4 c0.7,12.6,1.3,25.3,2,37.9c0.9,17.9,1.9,35.8,2.9,53.6c0.7,14,1.4,28,2.2,41.9c0.4,6.5,4.4,10.1,10.9,10.2c12,0,24,0,36,0 c24,0' +
        ',48,0,72,0c5.8,0,10.2-3.8,10.5-9.2c0.8-13.3,1.4-26.6,2.1-39.9c0.7-14.1,1.4-28.3,2.2-42.4c0.9-18.1,1.9-36.1,2.8-54.1 c0.6-11.5,1.2-23,1.8-34.4c0.3-6.1,0.6-12.3,0.9-18.5C119.2,39.8,69.8,39.8,20.1,39.8z ' +
        "M59.7,29.6c23.2,0,46.3,0,69.5,0 c0-3.6,0.2-7.1,0-10.4c-0.4-5.3-4.5-9.4-9.6-9.4c-16.8-0.1-33.6-0.1-50.4,0c-4.5,0-8.8,3.3-9.3,7.6C59.3,21.4,59.7,25.5,59.7,29.6z'/>" +
        "<path d='M98.9,218.2c-3.2,0-6.2,0-9.4,0c0-52.8,0-105.4,0-158.3c3.1,0,6.1,0,9.4,0C98.9,112.6,98.9,165.3,98.9,218.2z'/>" +
        "<path d='M129.2,59.4c3.3,0.2,6.2,0.4,9.7,0.7c-3.3,52.9-6.7,105.6-10,158.6c-3.2-0.2-6.2-0.4-9.7-0.6 C122.6,165.2,125.9,112.5,129.2,59.4z'/>" +
        "<path d='M49.7,60.3c3.3-0.2,6.3-0.4,9.7-0.6c3.4,52.8,6.8,105.5,10.1,158.3c-3.2,0.2-6.3,0.4-9.7,0.7C56.5,166,53.1,113.4,49.7,60.3z'/>" +
        '</svg>';
};
SVG.getBlackTrashcan = function() {

    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 188.4 248.2" class="fillBlack"> ' +
        "<path d='M10.2,39.6c-3,0-5.7,0.1-8.3-0.1c-0.7,0-1.8-1-1.8-1.6c-0.2-2.6-0.1-5.1-0.1-8c16.6,0,32.9,0,49.7,0c0-3.7,0-7.1,0-10.5 " +
        'C49.9,10.3,56,2.7,65,0.6C66.8,0.2,68.6,0,70.5,0c16,0,32-0.1,48,0c10.1,0,18.1,6.3,19.9,15.9c0.6,3.4,0.3,7,0.4,10.5 c0,1.1,0,2.1,0' +
        ',3.4c16.7,0,33.1,0,49.6,0c0,3.3,0,6.3,0,9.7c-3.1,0-6.3,0-9.6,0c-0.2,2.9-0.4,5.6-0.6,8.2 c-1.2,24.3-2.4,48.6-3.7,72.9c-1.4,27.2-2.9,54.4-4.3,81.6c-0.5,9.4-0.7,' +
        '18.8-1.5,28.2c-1,10.5-9.3,17.8-20,17.8 c-22.1,0-44.2,0-66.2,0c-13.8,0-27.7,0-41.5,0c-12.2,0-20.3-8-20.8-20.1c-1-20.4-2.2-40.8-3.3-61.1c-0.9-17.4-1.8-34.8-2.7-52.2 c-1.1-20.5-2.2-41.1-3.3-61.6C10.7,48.' +
        '8,10.5,44.4,10.2,39.6z M20.1,39.8c0,1,0,1.8,0,2.6c0.9,17.5,1.8,34.9,2.7,52.4 c0.7,12.6,1.3,25.3,2,37.9c0.9,17.9,1.9,35.8,2.9,53.6c0.7,14,1.4,28,2.2,41.9c0.4,6.5,4.4,10.1,10.9,10.2c12,0,24,0,36,0 c24,0' +
        ',48,0,72,0c5.8,0,10.2-3.8,10.5-9.2c0.8-13.3,1.4-26.6,2.1-39.9c0.7-14.1,1.4-28.3,2.2-42.4c0.9-18.1,1.9-36.1,2.8-54.1 c0.6-11.5,1.2-23,1.8-34.4c0.3-6.1,0.6-12.3,0.9-18.5C119.2,39.8,69.8,39.8,20.1,39.8z ' +
        "M59.7,29.6c23.2,0,46.3,0,69.5,0 c0-3.6,0.2-7.1,0-10.4c-0.4-5.3-4.5-9.4-9.6-9.4c-16.8-0.1-33.6-0.1-50.4,0c-4.5,0-8.8,3.3-9.3,7.6C59.3,21.4,59.7,25.5,59.7,29.6z'/>" +
        "<path d='M98.9,218.2c-3.2,0-6.2,0-9.4,0c0-52.8,0-105.4,0-158.3c3.1,0,6.1,0,9.4,0C98.9,112.6,98.9,165.3,98.9,218.2z'/>" +
        "<path d='M129.2,59.4c3.3,0.2,6.2,0.4,9.7,0.7c-3.3,52.9-6.7,105.6-10,158.6c-3.2-0.2-6.2-0.4-9.7-0.6 C122.6,165.2,125.9,112.5,129.2,59.4z'/>" +
        "<path d='M49.7,60.3c3.3-0.2,6.3-0.4,9.7-0.6c3.4,52.8,6.8,105.5,10.1,158.3c-3.2,0.2-6.3,0.4-9.7,0.7C56.5,166,53.1,113.4,49.7,60.3z'/>" +
        '</svg>';
};

// cloud icons
SVG.getCloudIconBlack = function() {

    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" class="cloudIconShared">' +
        '<path d="M622.49,193.79c-91.8,0-170.8,51.1-212.8,125.7a180.25,180.25,0,0,0-32.2-3.2c-80.3,0-147.8,51.8-172.8,123.6-3.6-.2-' +
        '7.2-1.1-10.9-1.1-101.5,0-183.8,82.3-183.8,183.7s82.3,183.8,183.8,183.8h612.5c101.4,0,183.8-82.3,183.8-183.8,0-80.3-51.8-147.9-123.6-1' +
        '72.9.1-3.7,1.1-7.2,1.1-10.9-.1-135.2-109.8-244.9-245.1-244.9Z"/>' +
        '</svg>';
};
SVG.getCloudIconGrey = function() {

    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" class="cloudIconLocal"> ' +
        '<path d="M622.49,255c100.6,0,181.81,85.35,183.8,181.5,1,49.83-2.6,56.2-2.6,56.2s9.3-.37,42.6,14.8c48.7,22.18,82.4,63.4,82.4,115A122.57,122.57,0,0' +
        ',1,806.19,745H193.79a122.63,122.63,0,0,1-122.5-122.5c0-66.9,48-118.83,120.6-122.5,31.79-1.61,52.1,6.33,52.1,6.33s.07-9.76,13-41C277,417,331.3,381,' +
        '375.61,377.76s66.28,9.83,66.28,9.83,1.43-8.6,21.4-38c39.5-58.16,93.6-94.6,159.2-94.6m0-61.2c-91.8,0-170.8,51.1-212.8,125.7a180.25,180.25,0,0,0-32.2-3.2c-' +
        '80.3,0-147.8,51.8-172.8,123.6-3.6-.2-7.2-1.1-10.9-1.1-101.5,0-183.8,82.3-183.8,183.7s82.3,183.8,183.8,183.8h612.5c101.4,0,183.8-82.3,183.8-183.8,0-80.3-51.8-' +
        '147.9-123.6-172.9.1-3.7,1.1-7.2,1.1-10.9-.1-135.2-109.8-244.9-245.1-244.9Z"/>' +
        '</svg>';
};
SVG.getCloudIconBlackQuestionnaires = function() {

    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" class="cloudIconQuestionnaireShared">' +
        '<path d="M622.49,193.79c-91.8,0-170.8,51.1-212.8,125.7a180.25,180.25,0,0,0-32.2-3.2c-80.3,0-147.8,51.8-172.8,123.6-3.6-.2-' +
        '7.2-1.1-10.9-1.1-101.5,0-183.8,82.3-183.8,183.7s82.3,183.8,183.8,183.8h612.5c101.4,0,183.8-82.3,183.8-183.8,0-80.3-51.8-147.9-123.6-1' +
        '72.9.1-3.7,1.1-7.2,1.1-10.9-.1-135.2-109.8-244.9-245.1-244.9Z"/>' +
        '</svg>';
};
SVG.getCloudIconGreyQuestionnaires = function() {

    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" class="cloudIconQuestionnaireLocal"> ' +
        '<path d="M622.49,255c100.6,0,181.81,85.35,183.8,181.5,1,49.83-2.6,56.2-2.6,56.2s9.3-.37,42.6,14.8c48.7,22.18,82.4,63.4,82.4,115A122.57,122.57,0,0' +
        ',1,806.19,745H193.79a122.63,122.63,0,0,1-122.5-122.5c0-66.9,48-118.83,120.6-122.5,31.79-1.61,52.1,6.33,52.1,6.33s.07-9.76,13-41C277,417,331.3,381,' +
        '375.61,377.76s66.28,9.83,66.28,9.83,1.43-8.6,21.4-38c39.5-58.16,93.6-94.6,159.2-94.6m0-61.2c-91.8,0-170.8,51.1-212.8,125.7a180.25,180.25,0,0,0-32.2-3.2c-' +
        '80.3,0-147.8,51.8-172.8,123.6-3.6-.2-7.2-1.1-10.9-1.1-101.5,0-183.8,82.3-183.8,183.7s82.3,183.8,183.8,183.8h612.5c101.4,0,183.8-82.3,183.8-183.8,0-80.3-51.8-' +
        '147.9-123.6-172.9.1-3.7,1.1-7.2,1.1-10.9-.1-135.2-109.8-244.9-245.1-244.9Z"/>' +
        '</svg>';
};
SVG.getDownloadFromCloudIcon = function() {

    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" class="sectionEditButtonSvg"> \n' +
        '<polygon points="504 996.25 693.5 806.79 582.82 806.79 582.78 535.63 425.18 535.63 425.18 806.79 314.5 806.79 504 996.25"/>\n' +
        '<path d="M866.5,377.6c.1-3.7,1.1-7.2,1.1-10.9-.1-135.2-109.8-244.9-245.1-244.9-91.8,0-170.8,51.1-212.8,125.7a180.25,180.25,0,0,0-3' +
        '2.2-3.2c-80.3,0-147.8,51.8-172.8,123.6-3.6-.2-7.2-1.1-10.9-1.1C92.3,366.8,10,449.1,10,550.5S92.3,734.3,193.8,734.3h159V673h-159A122.63,12' +
        '2.63,0,0,1,71.3,550.5c0-66.9,48-118.83,120.6-122.5,31.79-1.61,52.1,6.33,52.1,6.33s.07-9.76,13-41C277,345,331.31,309,375.62,305.77s66.28,9.' +
        '83,66.28,9.83,1.43-8.6,21.4-38c39.5-58.16,93.6-94.6,159.2-94.6,100.6,0,181.81,85.35,183.8,181.5,1,49.83-2.6,56.2-2.6,56.2s9.3-.37,42.6,14.8c48.' +
        '7,22.18,82.4,63.4,82.4,115A122.57,122.57,0,0,1,806.2,673h-151v61.3H806.3c101.4,0,183.8-82.3,183.8-183.8C990.1,470.2,938.3,402.6,866.5,377.6Z"/>\n' +
        '</svg>';
};

SVG.getUploadToCloudIcon = function() {

    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" class="sectionEditButtonSvg"> \n' +
        '<polygon points="504 483.07 314.5 672.54 425.18 672.54 425.22 943.69 582.82 943.69 582.82 672.54 693.5 672.54 504 483.07"/>\n' +
        '<path d="M866.5,449.6c.1-3.7,1.1-7.2,1.1-10.9-.1-135.2-109.8-244.9-245.1-244.9-91.8,0-170.8,51.1-212.8,125.7a180.25,180.25,0,0,0-32.2-3.2c-80.3,' +
        '0-147.8,51.8-172.8,123.6-3.6-.2-7.2-1.1-10.9-1.1C92.3,438.8,10,521.1,10,622.5S92.3,806.3,193.8,806.3h159V745h-159A122.63,122.63,0,0,1,71.3,622.5c0-66.9,48-118.83,' +
        '120.6-122.5,31.79-1.61,52.1,6.33,52.1,6.33s.07-9.76,13-41C277,417,331.31,381,375.62,377.77s66.28,9.83,66.28,9.83,1.43-8.6,21.4-38c39.5-58.16,93.6-94.6,159.2-94.6,100.6,0,181.81,85.35,183' +
        '.8,181.5,1,49.83-2.6,56.2-2.6,56.2s9.3-.37,42.6,14.8c48.7,22.18,82.4,63.4,82.4,115A122.57,122.57,0,0,1,806.2,745h-151v61.3H806.3c101.4,0,183.8-82.3,183.8-183.8C990.1,542.2,938.3,474.6,866.5,449.6Z"/>\n' +
        '</svg>';

};
SVG.getUploadToCloudIconSelected = function() {

    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" class="sectionEditButtonSvgSelected"> \n' +
        '<polygon points="504 483.07 314.5 672.54 425.18 672.54 425.22 943.69 582.82 943.69 582.82 672.54 693.5 672.54 504 483.07"/>\n' +
        '<path d="M866.5,449.6c.1-3.7,1.1-7.2,1.1-10.9-.1-135.2-109.8-244.9-245.1-244.9-91.8,0-170.8,51.1-212.8,125.7a180.25,180.25,0,0,0-32.2-3.2c-80.3,' +
        '0-147.8,51.8-172.8,123.6-3.6-.2-7.2-1.1-10.9-1.1C92.3,438.8,10,521.1,10,622.5S92.3,806.3,193.8,806.3h159V745h-159A122.63,122.63,0,0,1,71.3,622.5c0-66.9,48-118.83,' +
        '120.6-122.5,31.79-1.61,52.1,6.33,52.1,6.33s.07-9.76,13-41C277,417,331.31,381,375.62,377.77s66.28,9.83,66.28,9.83,1.43-8.6,21.4-38c39.5-58.16,93.6-94.6,159.2-94.6,100.6,0,181.81,85.35,183' +
        '.8,181.5,1,49.83-2.6,56.2-2.6,56.2s9.3-.37,42.6,14.8c48.7,22.18,82.4,63.4,82.4,115A122.57,122.57,0,0,1,806.2,745h-151v61.3H806.3c101.4,0,183.8-82.3,183.8-183.8C990.1,542.2,938.3,474.6,866.5,449.6Z"/>\n' +
        '</svg>';

};

// plus, minus signs
SVG.getPlusSign = function() {

    return '<svg class=testSVG xlmns="http://www.w3.org/2000/svg" ' + 'viewbox="0 0 100 100">' +
        '<polygon points="0,42 42,42 42,0 58,0 58,42 100,42 100,58 58,58 58,100 42,100 42,58 0,58"></polygon>' +
        '</svg>';
};
SVG.plusSignInnerHtml = function() {

    return '0,42 42,42 42,0 58,0 58,42 100,42 100,58 58,58 58,100 42,100 42,58 0,58';

};
SVG.getMainItemPlusSign = function() {
    return '<svg class=MainItemSVG xlmns="http://www.w3.org/2000/svg" ' + 'viewbox="0 0 100 100">' +
        '<polygon points="0,42 42,42 42,0 58,0 58,42 100,42 100,58 58,58 58,100 42,100 42,58 0,58"></polygon>' +
        '</svg>';

};
SVG.getBlackPlusSign = function() {

    return '<svg class=fillBlack xlmns="http://www.w3.org/2000/svg" ' + 'viewbox="0 0 100 100">' +
        '<polygon points="0,42 42,42 42,0 58,0 58,42 100,42 100,58 58,58 58,100 42,100 42,58 0,58"></polygon>' +
        '</svg>';
};
SVG.getMinusSign = function() {

    return '<svg class=testSVG xlmns="http://www.w3.org/2000/svg" ' + 'viewbox="0 0 100 100">' +
        '<polygon points="0,42 100,42 100,58 0,58"></polygon>' +
        '</svg>';
};
SVG.getBlackMinusSign = function() {

    return '<svg class=fillBlack xlmns="http://www.w3.org/2000/svg" ' + 'viewbox="0 0 100 100">' +
        '<polygon points="0,42 100,42 100,58 0,58"></polygon>' +
        '</svg>';
};
SVG.getBlackMinusSign = function() {

    return '<svg class=fillBlack xlmns="http://www.w3.org/2000/svg" ' + 'viewbox="0 0 100 100">' +
        '<polygon points="0,42 100,42 100,58 0,58"></polygon>' +
        '</svg>';
};
SVG.getRedMinusSign = function() {

    return '<svg class=fillRed xlmns="http://www.w3.org/2000/svg" ' + 'viewbox="0 0 100 100">' +
        '<polygon points="0,42 100,42 100,58 0,58"></polygon>' +
        '</svg>';
};

// shapes
SVG.hexagon = function() {

    return '<div class=svgContainerOuter>' +
        "<svg class=testSVG xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 88'>" +
        '<polygon points="27,3 74,3 97,44 74,84 27,84 3,44"></polygon>' +
        '<div class=svgContainerInner>' +
        "<svg class=testSVG2 xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 88'>" +
        '<polygon class=inner points="27,3 74,3 97,44 74,84 27,84 3,44"></polygon>' +
        '</svg>' +
        '<div class = svgContainerInnerMost>' +
        '<svg id="test" class= testSVG shape="leftArrow" xlmns="http://www.w3.org/2000/svg" ' + 'viewbox="0 0 100 100">' +
        '<polygon points="0,42 42,42 42,0 58,0 58,42 100,42 100,58 58,58 58,100 42,100 42,58 0,58"></polygon>' +
        '</svg>' +
        '</div>' +
        '</div>' +
        '</svg>' +
        '</div>';

};
SVG.hexagonExpanded = function() {

    return '<div class=svgContainerOuter>' +
        "<svg class=testSVG xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 88'>" +
        '<polygon points="27,3 74,3 97,44 74,84 27,84 3,44"></polygon>' +
        '<div class=svgContainerInner>' +
        "<svg class=testSVG2 xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 88'>" +
        '<polygon class=inner points="27,3 74,3 97,44 74,84 27,84 3,44"></polygon>' +
        '</svg>' +
        '<div class = svgContainerInnerMost>' +
        '<svg id="test" class= testSVG shape="leftArrow" xlmns="http://www.w3.org/2000/svg" ' + 'viewbox="0 0 100 100">' +
        '<polygon points="0,42 100,42 100,58 0,58"></polygon>' +
        '</svg>' +
        '</div>' +
        '</div>' +
        '</svg>' +
        '</div>';

};
SVG.subProjectHexagon = function() {

    return '<div class=svgSubContainerOuter>' +
        "<svg class=testSVG xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 88'>" +
        '<polygon points="27,3 74,3 97,44 74,84 27,84 3,44"></polygon>' +
        '<div class=svgContainerInner>' +
        "<svg class=testSVG3 xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 88'>" +
        '<polygon class=inner points="27,3 74,3 97,44 74,84 27,84 3,44"></polygon>' +
        '</svg>' +
        '</div>' +
        '</svg>' +
        '</div>';
};

// questionnaire branching elements
SVG.getBranchingLine = function(height, width, is_clone, num_nodes) {


    let styles = '';
    //
    // width = SVG.line_width;
    // if (!is_clone) SVG.line_width - offset;


    //

    // if (num_nodes === 1 || num_nodes === 2) width = 125;
    // if (num_nodes === 3 || num_nodes === 4) width = 100;
    // if (num_nodes === 5 || num_nodes === 6) width = 75;
    //

    if (is_clone) { width += 5; }

    const x_offset = width + 52;

    // reflect over y axis
    if (num_nodes % 2 === 1) { styles += ' transform: rotateY(180deg) translateX('+ (x_offset) + 'px); margin-left: 0;'; }

    // if (is_clone) styles += " transform: rotateY(180deg) translateX("+ (width + 52) + "px); margin-left: 0;"



    // let style = (num_nodes % 2 === 0) ? styles: "";

    const points = '0,0 '+width+',0 '+width+','+height+' 0,'+height;
    const arrow_points = '0,' + (height) + ' 5,' + (height - 5) + ' 5,' + (height + 5);


    // returns 3 sides line based upon starting and ending points
    // return "<svg xmlns=\"http://www.w3.org/2000/svg\" class=\"branch-line\" style=\" "+ styles+"\" preserveAspectRatio='xMinYMin'>  \n" +
    //     "  <polyline points=\" " + points + " \"/>\n" +
    //     " <polygon points=\" " + arrow_points + "\"/>" +
    //     "</svg>"

    return '<svg xmlns="http://www.w3.org/2000/svg" class="branch-line" style=" '+ styles+'">  \n' +
        '<polyline points=" ' + points + ' "/>\n' +
        '</svg>';


    // return "<svg class=\"branch-line\" style=\" "+ styles+"\">  \n" +
    //     "<defs>" +
    //     " <polyline id=\"branch-line\" points=\" " + points + " \"/>" +
    //     " <polyline id=\"branch-line-clone\" points=\" " + clone_points + " \"/>" +
    //
    //     "</defs>" +
    //     "<g  id=\"clickable\">\n" +
    //     "<use xlink:href=\"#branch-line\" stroke=\"#000\" stroke-width=\"5\" fill=\"none\"  fill-opacity=\"0.5\" />\n" +
    //     "<use xlink:href=\"#branch-line-clone\" stroke=\"#000\" stroke-width=\"30\" fill=\"none\"  stroke-opacity=\"0.5\" />\n" +
    //     "</g>" +
    //     "</svg>"

};



function getNextChar(char) {
  return String.fromCharCode(char.charCodeAt(0) + 1);
}

function DOM() {}

// flat list of all DOM IDs for reference
DOM.items = {};

// supported attributes for each html type
DOM.TAG_ATTRIBUTES = {
  a: ['id', 'class', 'style', 'href'],
  p: ['id', 'class', 'style', 'events'],
  span: ['id', 'class', 'style'],
  img: ['id', 'class', 'style', 'src', 'events'],
  table: ['id', 'class', 'style'],
  tr: ['id', 'class', 'style'],
  td: ['id', 'class', 'style', 'events', 'width'],
  div: ['id', 'class', 'style', 'events'],
  input: [
    'id',
    'name',
    'type',
    'class',
    'style',
    'value',
    'events',
    'placeholder',
    'multiple',
  ],
  textarea: [
    'id',
    'name',
    'class',
    'style',
    'events',
    'placeholder',
    'rows',
    'value',
  ],
  svg: [
    'path',
    'polygon',
    'class',
    'id',
    'viewBox',
    'xlmns',
    'parent',
    'html',
    'events',
  ],
  path: ['d'],
  polygon: ['points'],
  iframe: ['id', 'class', 'style', 'src'],
  button: ['id', 'label', 'class', 'style'],
  form: ['id', 'class', 'method', 'action', 'enctype', 'style'],
  video: ['id', 'class', 'src', 'type', 'controls'],
};

/** Main method for creating new DOM objects using this library **/
DOM.new = function(params) {
  // pass in a parameters JSON object contains html attributes
  // i.e DOM.new({tag: "div"}) creates an empty div

  const object = DOM.createElement(params);
  if (params.id) { DOM.items[params.id] = object; }
  if (params.parent) { $(object).appendTo($(params.parent)); }

  // add a child DOM element by adding a parameters JSON object to the children property
  // i.e. DOM.new({tag: "div", children: [{tag: "div"}, {tag: "p", html: "test"}]})
  // creates a div with two children, an empty div and a p with innerHTML 'test'

  // note the children property for the params JSON expects an array, even with a single child element
  //

  if (params && params.children) {
    for (const child of params.children) {
        if (child) {
          object.appendChild(DOM.new(child));
      }
    }
  }

  if (object) { return object; }
};

DOM.createElement = function(params) {
  let object = null;
  if (params) {
    if (params.tag in DOM.TAG_ATTRIBUTES) { object = DOM.createTag(params); }
  }
  return object;
};

DOM.createTag = function(params) {
  if (params) {
    const object = document.createElement(params.tag);
    if (params.html) { object.innerHTML = params.html; }
    // if (params["tag"] === "input") object.onclick = function () {
    //     Utils.configureInput(event, $(this));
    // };

    // attributes
    for (const param in params) {
      if (DOM.TAG_ATTRIBUTES[params.tag].includes(param)) {
        object.setAttribute(param, params[param]);
      }
    }

    // mouse events
    if (DOM.TAG_ATTRIBUTES[params.tag].includes('events')) {
      if (params.click) { object.addEventListener('click', params.click); }
      if (params.down) { object.addEventListener('down', params.down); }
      if (params.up) { object.addEventListener('up', params.up); }
      if (params.dblclick) {
        object.addEventListener('dblclick', params.dblclick);
      }
      if (params.keydown) {
        object.addEventListener('keydown', params.keydown);
      }
      if (params.mouseup) {
        object.addEventListener('mouseup', params.mouseup);
      }
      if (params.mousedown) {
        object.addEventListener('mousedown', params.mousedown);
      }
      if (params.mouseout) {
        object.addEventListener('mouseout', params.mouseout);
      }
      if (params.mouseleave) {
        object.addEventListener('mouseleave', params.mouseleave);
      }
      if (params.multiple) { object.setAttribute('multiple', ''); }
      if (params.mouseover) {
        object.addEventListener('mouseover', params.mouseover);
      }
      if (params.scroll) { object.addEventListener('scroll', params.scroll); }
      if (params.focus) { object.addEventListener('focus', params.focus); }
      if (params.dragstart) {
        object.addEventListener('dragstart', params.dragstart);
      }
      if (params.dragend) {
        object.addEventListener('dragend', params.dragend);
      }
      if (params.dragleave) {
        object.addEventListener('dragleave', params.dragleave);
      }
      if (params.scroll) { object.addEventListener('scroll', params.scroll); }
      if (params.input) { object.addEventListener('input', params.input); }

      // need to fix this so that only fires on enter, not on all keydowns
      if (params.enter) { object.addEventListener('keydown', params.enter); }
      if (params.blur) { object.addEventListener('blur', params.blur); }
      if (params.keyup) { object.addEventListener('keyup', params.keyup); }
    }
    if (object) { return object; }
  }
};

DOM.appendObject = function(parent, child) {
  parent.appendChild(child);
};

function Questionnaires() {}

Questionnaires.templates = [];
Questionnaires.timer = null;
Questionnaires.url = '/services/questionnaires2/';
Questionnaires.NO_QUESTION_TEXT = 'No question text';
Questionnaires.NO_ANSWER_TEXT = 'No answer text';
Questionnaires.REQUIRED_DEFAULT = true;
Questionnaires.ASSET_EMBEDDING_DEFAULT = true;
Questionnaires.ALLOW_BACK_DEFAULT = true;
Questionnaires.EDITABLE_DEFAULT = false;

Questionnaires.showSection = function () {
  if ($('#questionnaires-container').length) {
    $('#questionnaires-container, #add-questionnaire-item-button').removeClass('hidden');

    Questionnaires.sortTemplates();
  } else {
    //parent container
    DOM.new({
      tag: 'div',
      id: 'questionnaires-container',
      class: 'sectionWithHeader',
      style: 'background-color: transparent',
      children: [
        {
          tag: 'div',
          id: 'questionnaire-section-dock',
          class: 'sectionHeader',
          children: [
            { tag: 'p', id: 'questionnaire-save-indicator', class: 'questionnaire-save-indicator' },
            { tag: 'p', id: 'questionnaire-label', class: 'sectionHeaderLabel' },
            {
              tag: 'button',
              id: 'button-print-questionnaire',
              label: SVG.getPdfIcon(),
              style: ['buttonPrint', 'disabled', 'hidden'],
            },
            {
              tag: 'button',
              id: 'button-share-questionnaire',
              label: SVG.getUploadToCloudIcon(),
              style: ['buttonShare', 'hidden'],
            },
            {
              tag: 'button',
              id: 'button-public-questionnaires',
              label: SVG.getDownloadFromCloudIcon(),
              style: ['buttonAddItemTemplate', 'buttonPublicChecklists'],
              up_action: Questionnaires.togglePublicTemplatesMenu,
            },
            {
              tag: 'button',
              id: 'button-delete-questionnaire',
              label: SVG.getTrashcan(),
              style: ['buttonDelete', 'hidden'],
              up_action: function () {
                // $("#modal-primary").show();
                Utils.fadeInPrimaryModal();
                $('#delete-questionnaire-form').show();
              },
            },
            { tag: 'button', id: 'button-edit-questionnaire', label: SVG.getPencil(), style: ['buttonEditItems', 'hidden'] },
          ],
        },
        {
          tag: 'div',
          class: 'public-questionnaires-dropdown',
          style: 'left: 10px; margin: 0',
          children: [
            {
              tag: 'table',
              class: 'dropDownListTable',
              children: [
                {
                  tag: 'tr',
                  children: [
                    {
                      tag: 'td',
                      class: 'metadataItemHead',
                      children: [{ tag: 'p', class: 'tableHeader', html: 'Select to copy from public template' }],
                    },
                  ],
                },
              ],
            },
          ],
          parent: $('#questionnaires-container'),
        },
        { tag: 'div', id: 'questionnaires', class: 'subSection' },
        {
          tag: 'div',
          id: 'questionnaire-info-message',
          class: 'infoWrapper',
          children: [
            {
              tag: 'p',
              id: 'qnaire-message-1',
              class: 'infoMessage',
              style: 'color: hsl(45, 100%, 65%)',
              html: 'You do not have any Questionnaire Templates',
            },
            {
              tag: 'p',
              id: 'qnaire-message-2',
              class: 'infoMessage',
              style: 'color: hsl(45, 100%, 65%)',
              html: 'To create a Questionnaire Template, click the <b>Add</b> button at the lower right of the screen',
            },
          ],
        },
      ],
      parent: Content.div,
    });

    //add questionnaire form
    DOM.new({
      tag: 'div',
      id: 'add-questionnaire-form',
      class: 'checklistModalForm',
      style: 'width: 700px',
      parent: Content.div,
      children: [
        {
          tag: 'p',
          id: 'delete-checklist-label',
          class: 'listItemTitle',
          style: 'color: black; text-align: center',
          html: 'Create Questionnaire?',
        },
        {
          tag: 'div',
          id: 'wrapper',
          class: 'wrapper',
          style: 'text-align: center; padding: 0; margin-top: 10px',
          children: [
            {
              tag: 'div',
              class: 'wrapperNoPad',
              children: [
                { tag: 'p', class: 'questionnaireInfoHeader', html: 'Name' },
                {
                  tag: 'input',
                  id: 'questionnaire-name',
                  class: 'shortAnswer',
                  placeholder: 'Enter name',
                  style: 'margin: 10px 0 0 20px; width: 480px',
                },
              ],
            },
            {
              tag: 'div',
              class: 'wrapperNoPad',
              children: [
                { tag: 'p', class: 'questionnaireInfoHeader', html: 'Description' },
                {
                  tag: 'input',
                  id: 'questionnaire-desc',
                  class: 'shortAnswer',
                  placeholder: 'Enter description',
                  style: 'margin: 10px 0 0 20px; width: 480px',
                },
              ],
            },
            {
              tag: 'button',
              label: 'Cancel',
              style: ['buttonCancel', 'margin10', 'buttonFixedSize'],
              up_action: function () {
                Add_questionnaire_IS_VISIBLE = false;
                $('#modal-secondary, #modal-primary').fadeOut(300);
                $('#add-questionnaire-form').fadeOut(300);
              },
            },
            {
              tag: 'button',
              label: 'Create',
              style: ['buttonBlue', 'margin10', 'buttonFixedSize'],
              up_action: Questionnaires.createQuestionnaire,
            },
          ],
        },
      ],
    });

    //loading animation
    DOM.new({
      tag: 'div',
      id: 'questionnaires-loading-message',
      class: 'infoWrapper centerFlex hidden',
      parent: $('#questionnaires-container'),
      children: [
        {
          tag: 'div',
          class: 'uploadSpinner inline',
          children: [
            { tag: 'div', class: 'uploadSecondarySpinner transparent uploadSpinnerRotate' },
            { tag: 'img', src: 'lib/images/green_check_2.jpg', class: 'uploadCompleteCheckMark' },
          ],
        },
        { tag: 'p', id: 'questionnaires-loading-text', class: 'infoMessage inline', html: 'Loading Questionnaire Template...' },
      ],
    });

    //add question button
    DOM.new({
      tag: 'button',
      id: 'add-questionnaire-item-button',
      label: SVG.getMainItemPlusSign(),
      parent: Content.div,
      style: ['buttonAddItemTemplate', 'buttonAddMainItem'],
      up_action: function () {
        Utils.fadeInPrimaryModal();
        $('#modal-primary').css('pointer-events', 'all');
        $('#add-questionnaire-form').fadeIn();
        // Utils.fadeIn($("#add-questionnaire-form"), "flex", 400);
        $('#questionnaire-name').val('');
        $('#questionnaire-name').attr('value', '');
        $('#questionnaire-desc').val('');
        $('#questionnaire-desc').attr('value', '');
        $('#questionnaire-template').children('.questionWrapper').remove();
        $('#questionnaire-name').focus();
      },
    });

    //cancel questionnaire form
    DOM.new({
      tag: 'div',
      id: 'cancel-questionnaire-form',
      class: 'checklistModalForm',
      parent: Content.div,
      children: [
        {
          tag: 'p',
          id: 'cancel-checklist-label',
          class: 'listItemTitle',
          style: 'color: black; text-align: center',
          html: 'Delete Questionnaire Template?',
        },
        {
          tag: 'div',
          class: 'wrapper, centerText',
          children: [
            {
              tag: 'button',
              label: 'Cancel',
              style: ['buttonCancel', 'margin10'],
              up_action: function () {
                $('#modal-secondary').fadeOut(300);
                $('#cancel-questionnaire-form').fadeOut(300);
              },
            },
            {
              tag: 'button',
              id: 'cancel-questionnaire-button',
              label: 'Delete',
              style: ['buttonRed', 'margin10'],
              up_action: Content.cancelQuestionnaire,
            },
          ],
        },
      ],
    });

    //delete questionnaire form
    DOM.new({
      tag: 'div',
      id: 'delete-questionnaire-form',
      class: 'checklistModalForm',
      parent: Content.div,
      children: [
        {
          tag: 'p',
          id: 'delete-checklist-label',
          class: 'listItemTitle',
          style: 'color: black; text-align: center',
          html: 'Delete Questionnaire Template?',
        },
        {
          tag: 'div',
          class: 'wrapper, centerText',
          children: [
            {
              tag: 'button',
              label: 'Cancel',
              style: ['buttonCancel', 'margin10', 'buttonFixedSize'],
              up_action: function () {
                $('#modal-primary').fadeOut(300);
                $('#delete-questionnaire-form').fadeOut(300);
              },
            },
            {
              tag: 'button',
              id: 'confirm-delete-questionnaire-button',
              label: 'Delete',
              style: ['buttonRed', 'margin10', 'buttonFixedSize'],
            },
          ],
        },
      ],
    });

    //delete section form
    DOM.new({
      tag: 'div',
      id: 'delete-section-form',
      class: 'deleteSectionForm hideScrollBar',
      parent: Content.div,
      children: [
        {
          tag: 'div',
          class: 'containerBottomBar hideScrollBar',
          style: 'overflow-y: visible',
          children: [
            { tag: 'p', id: 'delete-section-label', class: 'formTitle', html: 'Delete Section?' },
            {
              tag: 'div',
              class: 'wrapper clickable',
              click: function () {
                $('#delete-section-form').find('.radioButtonActive').removeClass('radioButtonActive');
                $(this).find('.radioButton').addClass('radioButtonActive');
                $('#delete-section-form').find('.projectMenuButton, .buttonDeleteSection').addClass('disabled');
                $(this).next().removeClass('hidden');
                $(this).css('padding-bottom', '0');
                $('#delete-section-form').height('300px');
              },
              mouseover: function () {
                $(this).find('.radioButton').css('background-color', 'hsl(0, 0%, 90%)');
              },
              mouseout: function () {
                $(this).find('.radioButton').css('background-color', 'hsl(0, 100%, 100%)');
              },
              children: [
                { tag: 'div', class: 'radioButton' },
                { tag: 'p', class: 'formText inline', html: 'Delete section and all questions' },
              ],
            },
            {
              tag: 'div',
              class: 'wrapperNoPad hidden clickable indent',
              click: function () {
                $('#delete-section-form').find('.buttonDeleteSection').removeClass('disabled');
                if ($(this).find('.squareButton').hasClass('radioButtonActive')) {
                  $(this).find('.squareButton').removeClass('radioButtonActive');
                  $('#delete-section-form').find('.buttonDeleteSection').addClass('disabled');
                } else {
                  $(this).find('.squareButton').addClass('radioButtonActive');
                  $('#delete-section-form').find('.buttonDeleteSection').removeClass('disabled');
                }
              },
              mouseover: function () {
                $(this).find('.squareButton').css('background-color', 'hsl(0, 0%, 90%)');
              },
              mouseout: function () {
                $(this).find('.squareButton').css('background-color', 'hsl(0, 100%, 100%)');
              },
              children: [
                { tag: 'div', class: 'squareButton' },
                { tag: 'p', class: 'formText inline', html: 'Are you sure? This action cannot be undone' },
              ],
            },
            {
              tag: 'div',
              class: 'wrapper clickable',
              click: function () {
                $('#delete-section-form').find('.radioButtonActive').removeClass('radioButtonActive');
                $(this).find('.radioButton').addClass('radioButtonActive');
                $('#delete-section-form').find('.projectMenuButton').removeClass('disabled');
                $('#delete-section-form').find('.buttonDeleteSection').removeClass('disabled');
                $(this).prev().addClass('hidden');
                $(this).prev().prev().css('padding-bottom', '10px');
                $('#delete-section-form').height('260px');
              },
              mouseover: function () {
                $(this).find('.radioButton').css('background-color', 'hsl(0, 0%, 90%)');
              },
              mouseout: function () {
                $(this).find('.radioButton').css('background-color', 'hsl(0, 100%, 100%)');
                ('');
              },
              children: [
                { tag: 'div', class: 'radioButton' },
                { tag: 'p', class: 'formText inline', html: 'Move questions to' },
                {
                  tag: 'div',
                  class: 'projectMenuButton disabled',
                  style: 'width: auto; margin-left: 10px',
                  click: Questionnaires.toggleSectionMenu,
                  children: [
                    {
                      tag: 'div',
                      class: 'projectMenuTable unclickable',
                      style: 'padding: 5px 0',
                      children: [
                        {
                          tag: 'tr',
                          children: [
                            {
                              tag: 'td',
                              class: 'metadataItemText',
                              children: [
                                {
                                  tag: 'p',
                                  class: 'projectMenuButtonText',
                                  style: 'font-size: 14px; width: 175px',
                                  html: 'Section 1',
                                },
                              ],
                            },
                            {
                              tag: 'td',
                              class: 'metadataItemText',
                              children: [{ tag: 'div', class: 'buttonDropdown' }],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            { tag: 'div', id: 'questionnaire-dropdown-section-menu', class: 'sectionProjectMenu hideScrollBar' },
          ],
        },
        {
          tag: 'div',
          class: 'questionReorderControlBar',
          children: [
            {
              tag: 'button',
              label: 'Cancel',
              class: 'buttonCancelForm',
              up_action: function () {
                $('#delete-section-form').fadeOut();
                $('#modal-secondary').fadeOut(300);
              },
            },
            { tag: 'button', label: 'Delete Section', class: 'buttonDeleteSection disabled', up_action: function () {} },
          ],
        },
      ],
    });

    //delete empty section form
    DOM.new({
      tag: 'div',
      id: 'delete-empty-section-form',
      class: 'deleteEmptySectionForm hideScrollBar',
      parent: Content.div,
      children: [
        {
          tag: 'div',
          class: 'containerBottomBar hideScrollBar',
          style: 'overflow-y: visible',
          children: [
            { tag: 'p', id: 'delete-empty-section-label', class: 'formTitle', html: 'Delete Section?' },
            {
              tag: 'div',
              class: 'wrapper centerText',
              children: [{ tag: 'p', class: 'formText inline', html: 'Do you really want to delete this section?' }],
            },
          ],
        },
        {
          tag: 'div',
          class: 'questionReorderControlBar',
          children: [
            {
              tag: 'button',
              label: 'Cancel',
              class: 'buttonCancelForm',
              up_action: function () {
                $('#delete-section-form, #delete-empty-section-form').fadeOut();
                $('#modal-secondary').fadeOut(300);
              },
            },
            { tag: 'button', label: 'Delete Section', class: 'buttonDeleteSection', up_action: function () {} },
          ],
        },
      ],
    });

    //delete question form
    DOM.new({
      tag: 'div',
      id: 'delete-question-form',
      class: 'deleteEmptySectionForm hideScrollBar',
      parent: Content.div,
      children: [
        {
          tag: 'div',
          class: 'containerBottomBar hideScrollBar',
          style: 'overflow-y: visible',
          children: [
            { tag: 'p', id: 'delete-question-label', class: 'formTitle', html: 'Delete Question?' },
            {
              tag: 'div',
              class: 'wrapper centerText',
              children: [{ tag: 'p', class: 'formText inline', html: 'Do you really want to delete this question?' }],
            },
          ],
        },
        {
          tag: 'div',
          class: 'questionReorderControlBar',
          children: [
            {
              tag: 'button',
              label: 'Cancel',
              class: 'buttonCancelForm',
              up_action: function () {
                $('#delete-question-form').fadeOut();
                $('#modal-secondary').fadeOut(300);
              },
            },
            {
              tag: 'button',
              id: 'confirm-delete-question-button',
              label: 'Delete Question',
              class: 'buttonDeleteSection',
              up_action: function () {},
            },
          ],
        },
      ],
    });

    //questionnaire viewer
    DOM.new({
      tag: 'div',
      id: 'questionnaire-viewer',
      class: 'questionnaireViewContainer',
      parent: Content.div,
      children: [
        { tag: 'div', id: 'questionnaire-modal', class: 'sectionModal' },
        { tag: 'p', class: 'modalMessage', html: 'Select a question or section from the list on the right \xa0 &#9654' },

        //question scroll bar
        {
          tag: 'div',
          id: 'question-scroll-bar',
          class: 'questionScrollBar',
          children: [
            { tag: 'div', id: 'intro-scroll-icon', class: 'headerScrollIcon', html: 'Info' },
            { tag: 'div', id: 'end-scroll-icon', class: 'headerScrollIcon', html: 'End' },
          ],
        },

        //go to selection scroll bar
        //appears over top of standard scroll bar to allow user to select go to questions for single select questions
        {
          tag: 'div',
          id: 'select-goto-scroll-bar',
          class: 'questionScrollBar hidden',
          children: [
            { tag: 'div', class: 'headerScrollIcon disabledClickable infoIcon', html: 'Info' },
            { tag: 'div', class: 'headerScrollIcon endIcon', html: 'End' },
          ],
        },

        //view container for questions
        { tag: 'div', id: 'questionnaire-view-template', class: 'questionContainer' },

        //control bar
        {
          tag: 'div',
          class: 'questionControlBar',
          children: [
            { tag: 'button', id: 'button-previous-question', label: 'Previous', class: 'buttonPreviousQuestion' },
            { tag: 'button', id: 'button-show-branching', label: 'Question Flow', class: 'button-show-branching' },
            { tag: 'button', id: 'button-reorder-questions', label: 'Reorder Items', class: 'buttonReorderQuestion disabled' },
            {
              tag: 'button',
              id: 'button-add-question',
              class: 'buttonAddQuestion disabled',
              children: [
                { tag: 'p', class: 'questionLabel', style: 'font-size: 18px', html: 'Add Item' },
                { tag: 'button', class: 'buttonAddQuestionIcon', label: SVG.getPlusSign() },
              ],
            },
            { tag: 'button', id: 'button-next-question', label: 'Next', class: 'buttonNextQuestion' },
          ],
        },
      ],
    });

    //copy questionnaire modal form
    DOM.new({
      tag: 'div',
      id: 'copy-questionnaire-form',
      class: 'checklistModalForm',
      parent: Content.div,
      children: [
        { tag: 'p', id: 'copy-questionnaire-label', class: 'listItemTitle', style: 'color: black; text-align: center' },
        {
          tag: 'div',
          class: 'wrapper',
          children: [
            {
              tag: 'p',
              class: 'listItemTitle',
              style: 'color: black; display: inline-block; margin-right: 10px',
              html: 'Name',
            },
            {
              tag: 'input',
              id: 'new-questionnaire-name-field',
              class: 'Standard',
              style: 'display: inline-block; width: auto; min-width: 400px',
            },
          ],
        },
        {
          tag: 'div',
          class: 'wrapper, centerText',
          children: [
            { tag: 'button', label: 'Cancel', style: ['buttonCancel', 'margin10'] },
            { tag: 'button', label: 'Copy', style: ['buttonBlue', 'margin10'] },
          ],
        },
      ],
    });

    // questionnaire info message
    DOM.new({
      tag: 'div',
      id: 'questionnaire-info-message',
      class: 'infoWrapper',
      children: [
        {
          tag: 'p',
          id: 'qnaire-message-1',
          class: 'infoMessage',
          style: 'color: hsl(45, 100%, 65%)',
          html: 'You do not have any Questionnaire Templates',
        },
        {
          tag: 'p',
          id: 'qnaire-message-2',
          class: 'infoMessage',
          style: 'color: hsl(45, 100%, 65%)',
          html: 'To create a Questionnaire Template, click the <b>Add</b> button at the lower right of the screen',
        },
      ],
      parent: $('#questionnaires-container'),
    });

    // update questionnaire confirm form
    DOM.new({
      tag: 'div',
      id: 'update-questionnaire-confirm-form',
      class: 'checklistModalForm',
      parent: Content.div,
      children: [
        {
          tag: 'p',
          class: 'listItemTitle',
          style: 'color: black; text-align: center; padding-bottom: 20px',
          html: 'Do you really want to update this questionnaire?',
        },
        {
          tag: 'div',
          class: 'wrapper, centerText',
          children: [
            {
              tag: 'button',
              label: 'Cancel',
              style: ['buttonCancel', 'margin10', 'buttonFixedSize'],
              up_action: function () {
                $('#modal-primary').fadeOut(300);
                $('#update-questionnaire-confirm-form').fadeOut(300);
              },
            },
            {
              tag: 'button',
              id: 'confirm-update-questionnaire-button',
              label: 'Update',
              style: ['buttonBlue', 'margin10', 'buttonFixedSize'],
            },
          ],
        },
      ],
    });

    //get questionnaires
    Questionnaires.getTemplates();
    $('#add-questionnaire-item-button').removeClass('hidden').show();
  }
};

Questionnaires.getTemplateById = function (id) {
  for (let template of Questionnaires.templates) {
    if (template.uuid === id) return template;
    if (template.id === id) return template;
  }
  return false;
};
Questionnaires.refreshTemplates = function () {
  let users = ['adioso, dstro, troyt'];
  if (!user.includes(Content.user)) {
    Questionnaires.TEMPLATES_LOADED = false;
    Questionnaires.templates = [];
  }
};
Questionnaires.getTemplates = function () {
  if (!Questionnaires.TEMPLATES_LOADED) {
    let callback = function (response_text) {
      let response = JSON.parse(response_text);

      // create questionnaire objects from metadata on server
      // only high level metadata at this stage, questionnaire contents when clicking
      // on a template list item for the first time
      for (let metadata of response.questionnaires) new QuestionnaireTemplate(metadata);
      if (Questionnaires.templates.filter((template) => template.owner === Content.user).length === 0)
        $('#questionnaire-info-message').show();
      Questionnaires.TEMPLATES_LOADED = true;
      Questionnaires.sortTemplates();

      let is_copy;

      // check which private questionnaires are copies
      for (let questionnaire of Questionnaires.templates.filter((template) => template.owner === Content.user)) {
        is_copy = false;

        for (let qnaire_template of Questionnaires.templates.filter((template) => template !== questionnaire))
          if (qnaire_template.uuid === questionnaire.version) is_copy = true;

        // copied templates get an update button that allows them to be updated to the latest version of their original template
        if (is_copy) {
          questionnaire.is_copy = is_copy;

          DOM.new({
            tag: 'p',
            html: 'Up to date.',
            class: 'hidden',
            parent: $(questionnaire.list_item).find('.questionnaire-list-item-access-row'),
          });
          DOM.new({
            tag: 'div',
            class: 'button-questionnaire-update',
            html: 'Update',
            click: function (e) {
              questionnaire.showUpdateForm(e);
            },
            parent: $(questionnaire.list_item).find('.questionnaire-list-item-access-row'),
          });
        }
      }
    };
    Ajax.doGet(Questionnaires.url, callback, null);
  } else {
  }

  // gets questionnaire templates from rapid
};
Questionnaires.sortTemplates = function () {
  let sorted_projects = $('#questionnaires-container .questionnaire-list-item').sort(function (a, b) {
    let a_name = $(a).find('.listItemTitle').html().toLowerCase();
    let b_name = $(b).find('.listItemTitle').html().toLowerCase();

    return a_name < b_name ? -1 : a_name > b_name ? 1 : 0;
  });

  $('#questionnaires').append(sorted_projects);
};
Questionnaires.sortPublicTemplates = function () {
  let public_template_list_items = $('.public-questionnaires-dropdown tr').slice(1);

  let sorted_projects = public_template_list_items.sort(function (a, b) {
    let a_name = $(a).find('.tableValue').html().toLowerCase();
    let b_name = $(b).find('.tableValue').html().toLowerCase();

    return a_name < b_name ? -1 : a_name > b_name ? 1 : 0;
  });

  $('.public-questionnaires-dropdown .dropDownListTable').append(sorted_projects);
};
Questionnaires.deleteAllTemplates = function () {
  if (Questionnaires.templates) for (let template of Questionnaires.templates) template.deleteTemplate();
  $('#questionnaire-info-message').show();
};
Questionnaires.togglePublicTemplatesMenu = function (e) {
  e.stopPropagation();

  if (Questionnaires.public_templates_menu_open) {
    $('.public-questionnaires-dropdown').css('transform', 'translateY(0%)');
    $('#button-public-questionnaires').css('background-color', 'hsl(200, 75%, 30%)').css('color', 'hsl(0, 0%, 100%)');
    $('#button-public-questionnaires').children('svg').removeClass('sectionEditButtonSvgSelected').addClass('sectionEditButtonSvg');
    Questionnaires.public_templates_menu_open = false;
  } else {
    Questionnaires.sortPublicTemplates();

    $('#button-public-questionnaires').css('background-color', 'white').css('color', 'hsl(200, 75%, 30%)');
    $('#button-public-questionnaires').children('svg').addClass('sectionEditButtonSvgSelected').removeClass('sectionEditButtonSvg');

    setTimeout(function () {
      //descending
      $('.public-questionnaires-dropdown').css('transform', 'translateY(calc(100% + 10px)');
    }, 100);

    Questionnaires.public_templates_menu_open = true;
  }
};

Questionnaires.public_templates_menu_open = false;
Questionnaires.go_to_menu_open = false;
Questionnaires.projectMenuVisible = false;
Questionnaires.TEMPLATES_LOADED = false;
Questionnaires.EMBEDDED_ASSET_PANEL_OPEN = false;
Questionnaires.embedded_asset_map = null;

function QuestionnaireBuilder() {}

QuestionnaireBuilder.NO_QUESTION_TEXT = 'No question text';
QuestionnaireBuilder.NO_ANSWER_TEXT = 'No answer text';
QuestionnaireBuilder.REQUIRED_DEFAULT = true;
QuestionnaireBuilder.ASSET_EMBEDDING_DEFAULT = true;
QuestionnaireBuilder.ALLOW_BACK_DEFAULT = true;
QuestionnaireBuilder.EDITABLE_DEFAULT = false;

QuestionnaireBuilder.renderQuestionnaire = function(questionnaire_json) {
  /** Method to generate read only questionnaire for viewing in DesignSafe
   *
   * Takes a json object containing questionnaire structure and responses
   *
   * Converts json object to a Questionnaire object then creates view for each question and appends to a container div
   *
   * **/

  const questionnaire = new Questionnaire(questionnaire_json, null);
  if (questionnaire) { return questionnaire.renderView(); }
};

class Questionnaire {
  constructor(metadata, questionnaire_asset_viewer) {
    //add metadata
    let qnaire = this;
    qnaire.num_questions = 0;
    for (let property in metadata) qnaire[property] = metadata[property];
    if (questionnaire_asset_viewer) this.questionnaire_asset_viewer = questionnaire_asset_viewer;
    qnaire.table_cells = [];

    //maps question number to question object
    qnaire.question_map = {};
    qnaire.question_id_map = {};
    qnaire.section_id_map = {};
    qnaire.sections = [];

    qnaire.MAP_ADDED_TO_PANEL = false;
    qnaire.embedded_asset_map = null;

    if (metadata.sections) for (let section of metadata.sections) new Section(qnaire, section, false);

    // master list of embedded asset uuids
    qnaire.embedded_asset_uuids = [];

    for (let question of Object.values(qnaire.question_id_map)) {
      if (!question.hasOwnProperty('assetUuids')) continue;
      if (question.assetUuids.length) {
        for (let asset of question.assetUuids) qnaire.embedded_asset_uuids.push(asset);
      }
    }
  }

  // getEmbeddedAssetViewer(question_uuid, asset_uuid, parent_element_id) {
  //
  //     // show embedded asset viewer in modal window
  //     // identical to map viewer asset viewer
  //
  //     let questionnaire = this;
  //     let embedded_asset_viewer = $("#embedded-asset-viewer-container");
  //     let modal_id = (parent_element_id.includes("map")) ? "modal-map" : "modal-primary"
  //     let question = questionnaire.getItemById(question_uuid)
  //     let asset = Assets.getAsset(asset_uuid)
  //     let asset_index =  questionnaire.embedded_asset_uuids.indexOf(asset_uuid)
  //     let current_asset_index = asset_index
  //     let metadata = asset.getMetadataTable()
  //     let map = null
  //
  //     if (!embedded_asset_viewer.length) {
  //
  //         embedded_asset_viewer = DOM.new({tag: "div", id: "embedded-asset-viewer-container",
  //             click: function () {
  //                 $(embedded_asset_viewer).find(".single-select-dropdown-menu").addClass("hidden");
  //             }, class: "modalForm hideScrollBar embeddedAssetViewerContainer", children: [
  //                 {tag: "div", class: "reorderQuestionContainer assetViewerQuestionContainer hideScrollBar", children: [
  //                         {tag: "div", class: "embeddedAssetHeader", children: [
  //                                 {tag: "p", class: "questionNumber"},
  //                                 {tag: "p", class: "questionText"}
  //                             ]},
  //                         {tag: "div", class: "embeddedAssetContainer", children: [
  //                                 {tag: "div", class: "embeddedAssetImgContainer", children: [
  //                                         {tag: "div", class: "embeddedAssetImg"}
  //                                     ]},
  //                                 {tag: "div", class: "embeddedAssetDetails hideScrollBar", children: [
  //                                         {tag: 'div', id : "map-sample-canvas"},
  //                                         {tag: 'div', id: "metadata-table", children: [
  //                                                 {tag: "p", class: "infoPanelHeading", html: "Metadata"},
  //                                                 // {tag: "table", class: "metadataTable", children: metadata}
  //                                             ]}
  //                                     ]}
  //                             ]}
  //                     ]},
  //
  //                 {tag: "div", class: "questionReorderControlBar", children: [
  //                         {tag: "div", class: "viewerNavigationControls", children: [
  //                                 {tag: "p", class: "leftArrow"},
  //                                 {tag: "p", class: "rightArrow"},
  //                                 {tag: "p", class: "viewCountNumber"},
  //                                 {tag: "p", class: "viewCountTotal"}
  //                             ]},
  //                         {tag: "button", label: "Done", class: "buttonDone"}
  //                     ]},
  //             ]})
  //
  //         // $(embedded_asset_viewer).find("#map-sample-canvas").empty()
  //     }
  //
  //     $(embedded_asset_viewer).find("#map-sample-canvas").empty()
  //     let view_mode_map_canvas = DOM.new({tag: "div", class: "embeddedAssetLocation", parent: $(embedded_asset_viewer).find("#map-sample-canvas")});
  //     map = L.map(view_mode_map_canvas).setView([45, -122], 16);
  //     L.tileLayer(Map.basemaps["satellite"]["url"]).addTo(map);
  //
  //     (function(){
  //         let originalInitTile = L.GridLayer.prototype._initTile;
  //         L.GridLayer.include({
  //             _initTile: function (tile) {
  //                 originalInitTile.call(this, tile);
  //                 let tileSize = this.getTileSize();
  //                 tile.style.width = tileSize.x + 1 + "px";
  //                 tile.style.height = tileSize.y + 1 + "px";
  //             }
  //         });
  //     })();
  //
  //     $(embedded_asset_viewer).appendTo($("#" + parent_element_id))
  //
  //
  //     let left_arrow = $(embedded_asset_viewer).find("p.leftArrow")
  //     let right_arrow = $(embedded_asset_viewer).find("p.rightArrow")
  //
  //     let change_image = function (emb_asset_index) {
  //
  //         let asset_uuid = questionnaire.embedded_asset_uuids[emb_asset_index]
  //         let asset = Assets.getAsset(asset_uuid)
  //         let new_question = null;
  //         for (let question of Object.values(questionnaire.question_id_map)) {
  //             if (question.assetUuids != null) {
  //                 for (let uuid of question.assetUuids) {
  //                     if (uuid === asset_uuid) {
  //                         new_question = question
  //                         break
  //                     }
  //                 }
  //             }
  //         }
  //
  //         if (new_question) {
  //             show_embedded_asset(new_question.id, asset_uuid);
  //         }
  //     }
  //
  //     $(left_arrow).unbind().click(function () {
  //         current_asset_index--
  //         change_image(current_asset_index)
  //     })
  //
  //     $(right_arrow).unbind().click(function () {
  //         current_asset_index++
  //         change_image(current_asset_index)
  //     })
  //
  //     let show_embedded_asset = function (question_uuid, asset_uuid) {
  //
  //         let heading_icon = L.icon({iconUrl: 'lib/images/photo_location_marker.png', iconSize: [50, 50]});
  //
  //         $(embedded_asset_viewer).find(".buttonDone").unbind().click(function () {
  //             Questionnaires.EMBEDDED_ASSET_PANEL_OPEN = false
  //             $(embedded_asset_viewer).fadeOut();
  //             Utils.removeModal(modal_id, "fade")
  //         })
  //         let lat = 47.6468
  //         let lon = -122.3353
  //
  //         if (asset.metadata.geolocation != null) {
  //             if (asset.metadata.geolocation[0].hasOwnProperty("latitude") && asset.metadata.geolocation[0].hasOwnProperty("longitude")) {
  //                 lat = asset.metadata.geolocation[0].latitude
  //                 lon = asset.metadata.geolocation[0].longitude
  //             }
  //         }
  //
  //         L.marker([lat, lon],{icon: heading_icon}).addTo(map);
  //         map.setView([lat, lon], 16);
  //
  //         $(embedded_asset_viewer).find(".questionNumber").html("Q" + question.template_question_num)
  //         $(embedded_asset_viewer).find(".questionText").html(question.label)
  //         $(embedded_asset_viewer).find(".viewCountNumber").html(asset_index + 1)
  //         $(embedded_asset_viewer).find(".viewCountTotal").html("/" + questionnaire.embedded_asset_uuids.length)
  //         $(embedded_asset_viewer).find(".metadataTable").remove()
  //         DOM.new({tag: "table", class: "metadataTable", parent: $(embedded_asset_viewer).find("#metadata-table"), children: metadata})
  //
  //
  //         // style navigation arrows
  //         if (questionnaire.embedded_asset_uuids.length) {
  //
  //             let index = questionnaire.embedded_asset_uuids.indexOf(asset_uuid)
  //
  //             // first item
  //             if (index > -1) {
  //                 if (index === 0) {
  //                     $(left_arrow).addClass("disabled")
  //                     $(right_arrow).removeClass("disabled")
  //                     if (index === questionnaire.embedded_asset_uuids.length - 1) {
  //                         $(right_arrow).addClass("disabled")
  //                     }
  //                 }
  //
  //                 if (index === questionnaire.embedded_asset_uuids.length - 1) {
  //                     // last item
  //                     $(left_arrow).removeClass("disabled")
  //                     $(right_arrow).addClass("disabled")
  //                 }
  //
  //                 if (index > 0 && index < questionnaire.embedded_asset_uuids.length - 1) {
  //                     $(left_arrow).removeClass("disabled")
  //                     $(right_arrow).removeClass("disabled")
  //                 }
  //             }
  //         }
  //
  //         let url = (Parameters.deployment === "live") ?  "https://rapid.apl.uw.edu" + asset.file_url :
  //             "https://rapid2.apl.uw.edu" + asset.file_url
  //
  //         $("#embedded-asset-viewer-container .embeddedAssetImg").css("background-image", "none")
  //         url = url.replace("(", "%28").replace(")", "%29");
  //         $("#embedded-asset-viewer-container .embeddedAssetImg").css('background-image', "url("+url+")");
  //         map.invalidateSize()
  //     }
  //
  //     show_embedded_asset(question_uuid, asset_uuid)
  //
  //
  //
  //
  //     // if (!questionnaire.embedded_asset_map) {
  //     //     let view_mode_map_canvas = DOM.new({tag: "div", class: "embeddedAssetLocation", parent: $(embedded_asset_viewer).find("#map-sample-canvas")});
  //     //     Questionnaires.embedded_asset_map = L.map(view_mode_map_canvas).setView([lat, lon], 16);
  //     //     L.tileLayer(Map.basemaps["satellite"]["url"]).addTo(map);
  //     //     L.marker([lat, lon],{icon: heading_icon}).addTo(map);
  //     // }
  //
  //
  //
  //     // // let heading_icon = L.icon({iconUrl: "http://www.nanoos.org/services/get_value_direction_marker.php?degrees=" + asset.heading + "&hue=200&imgpx=225", iconSize: [50, 50]});
  //     //
  //     //     // tile hack
  //     // (function(){
  //     //     let originalInitTile = L.GridLayer.prototype._initTile;
  //     //     L.GridLayer.include({
  //     //         _initTile: function (tile) {
  //     //             originalInitTile.call(this, tile);
  //     //             let tileSize = this.getTileSize();
  //     //             tile.style.width = tileSize.x + 1 + "px";
  //     //             tile.style.height = tileSize.y + 1 + "px";
  //     //         }
  //     //     });
  //     // })();
  //
  //
  //     // only draw question with embedded asset
  //
  //     if (!Questionnaires.EMBEDDED_ASSET_PANEL_OPEN) {
  //         Questionnaires.EMBEDDED_ASSET_PANEL_OPEN = true
  //         Utils.getModal(modal_id, "fade")
  //         $(embedded_asset_viewer).fadeIn();
  //         map.invalidateSize()
  //     }
  // };

  getEmbeddedAssetViewer(question_uuid, asset_uuid, parent_element_id) {
    // show embedded asset viewer in modal window
    // identical to map viewer asset viewer

    let questionnaire = this;
    let embedded_asset_viewer = $('#embedded-asset-viewer-container');
    let modal_id = parent_element_id.includes('map') ? 'modal-map' : 'modal-primary';
    let question = questionnaire.getItemById(question_uuid);
    let asset = Assets.getAsset(asset_uuid);
    let asset_index = questionnaire.embedded_asset_uuids.indexOf(asset_uuid);
    let current_asset_index = asset_index;

    let map = null;
    let marker = null;

    if (!embedded_asset_viewer.length) {
      embedded_asset_viewer = DOM.new({
        tag: 'div',
        id: 'embedded-asset-viewer-container',
        click: function () {
          $(embedded_asset_viewer).find('.single-select-dropdown-menu').addClass('hidden');
        },
        class: 'modalForm hideScrollBar embeddedAssetViewerContainer',
        children: [
          {
            tag: 'div',
            class: 'reorderQuestionContainer assetViewerQuestionContainer hideScrollBar',
            children: [
              {
                tag: 'div',
                class: 'embeddedAssetHeader',
                children: [
                  { tag: 'p', class: 'questionNumber' },
                  { tag: 'p', class: 'questionText' },
                ],
              },
              {
                tag: 'div',
                class: 'embeddedAssetContainer',
                children: [
                  {
                    tag: 'div',
                    class: 'embeddedAssetImgContainer',
                    children: [{ tag: 'div', class: 'embeddedAssetImg' }],
                  },
                  {
                    tag: 'div',
                    class: 'embeddedAssetDetails hideScrollBar',
                    children: [
                      { tag: 'div', id: 'map-sample-canvas' },
                      {
                        tag: 'div',
                        id: 'metadata-table',
                        children: [
                          { tag: 'p', class: 'infoPanelHeading', html: 'Metadata' },
                          // {tag: "table", class: "metadataTable", children: metadata}
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            tag: 'div',
            class: 'questionReorderControlBar',
            children: [
              {
                tag: 'div',
                class: 'viewerNavigationControls',
                children: [
                  { tag: 'p', class: 'leftArrow' },
                  { tag: 'p', class: 'rightArrow' },
                  { tag: 'p', class: 'viewCountNumber' },
                  { tag: 'p', class: 'viewCountTotal' },
                ],
              },
              { tag: 'button', label: 'Done', class: 'buttonDone' },
            ],
          },
        ],
      });

      // $(embedded_asset_viewer).find("#map-sample-canvas").empty()
    }

    $(embedded_asset_viewer).find('#map-sample-canvas').empty();
    let view_mode_map_canvas = DOM.new({
      tag: 'div',
      class: 'embeddedAssetLocation',
      parent: $(embedded_asset_viewer).find('#map-sample-canvas'),
    });
    map = L.map(view_mode_map_canvas).setView([45, -122], 16);
    L.tileLayer(Map.basemaps['satellite']['url']).addTo(map);

    (function () {
      let originalInitTile = L.GridLayer.prototype._initTile;
      L.GridLayer.include({
        _initTile: function (tile) {
          originalInitTile.call(this, tile);
          let tileSize = this.getTileSize();
          tile.style.width = tileSize.x + 1 + 'px';
          tile.style.height = tileSize.y + 1 + 'px';
        },
      });
    })();

    $(embedded_asset_viewer).appendTo($('#' + parent_element_id));

    let left_arrow = $(embedded_asset_viewer).find('p.leftArrow');
    let right_arrow = $(embedded_asset_viewer).find('p.rightArrow');

    let change_image = function (emb_asset_index) {
      let asset_uuid = questionnaire.embedded_asset_uuids[emb_asset_index];
      asset = Assets.getAsset(asset_uuid);
      current_asset_index = questionnaire.embedded_asset_uuids.indexOf(asset_uuid);

      let new_question = null;

      for (let question of Object.values(questionnaire.question_id_map)) {
        if (question.assetUuids != null) {
          for (let uuid of question.assetUuids) {
            if (uuid === asset_uuid) {
              new_question = question;
              break;
            }
          }
        }
      }

      if (new_question) show_embedded_asset(new_question.id, asset_uuid);
    };

    $(left_arrow)
      .unbind()
      .click(function () {
        current_asset_index--;
        change_image(current_asset_index);
      });

    $(right_arrow)
      .unbind()
      .click(function () {
        current_asset_index++;
        change_image(current_asset_index);
      });

    let show_embedded_asset = function (question_uuid, asset_uuid) {
      let heading_icon = L.icon({ iconUrl: 'lib/images/photo_location_marker.png', iconSize: [50, 50] });

      $(embedded_asset_viewer)
        .find('.buttonDone')
        .unbind()
        .click(function () {
          Questionnaires.EMBEDDED_ASSET_PANEL_OPEN = false;
          $(embedded_asset_viewer).fadeOut();
          Utils.removeModal(modal_id, 'fade');
        });

      let lat = 47.6468;
      let lon = -122.3353;

      if (asset.metadata.geolocation != null) {
        if (asset.metadata.geolocation[0].hasOwnProperty('latitude') && asset.metadata.geolocation[0].hasOwnProperty('longitude')) {
          lat = asset.metadata.geolocation[0].latitude;
          lon = asset.metadata.geolocation[0].longitude;
        }
      }

      if (marker) map.removeLayer(marker);
      marker = L.marker([lat, lon], { icon: heading_icon }).addTo(map);
      map.setView([lat, lon], 16);

      $(embedded_asset_viewer)
        .find('.questionNumber')
        .html('Q' + question.template_question_num);
      $(embedded_asset_viewer).find('.questionText').html(question.label);
      $(embedded_asset_viewer)
        .find('.viewCountNumber')
        .html(current_asset_index + 1);
      $(embedded_asset_viewer)
        .find('.viewCountTotal')
        .html('/' + questionnaire.embedded_asset_uuids.length);
      $(embedded_asset_viewer).find('.metadataTable').remove();
      DOM.new({
        tag: 'table',
        class: 'metadataTable',
        parent: $(embedded_asset_viewer).find('#metadata-table'),
        children: asset.getMetadataTable(),
      });

      // style navigation arrows
      if (questionnaire.embedded_asset_uuids.length) {
        let index = questionnaire.embedded_asset_uuids.indexOf(asset_uuid);

        // first item
        if (index > -1) {
          if (index === 0) {
            $(left_arrow).addClass('disabled');
            $(right_arrow).removeClass('disabled');
            if (index === questionnaire.embedded_asset_uuids.length - 1) {
              $(right_arrow).addClass('disabled');
            }
          }

          if (index === questionnaire.embedded_asset_uuids.length - 1) {
            // last item
            $(left_arrow).removeClass('disabled');
            $(right_arrow).addClass('disabled');
          }

          if (index > 0 && index < questionnaire.embedded_asset_uuids.length - 1) {
            $(left_arrow).removeClass('disabled');
            $(right_arrow).removeClass('disabled');
          }
        }
      }

      let url =
        Parameters.deployment === 'live'
          ? 'https://rapid.apl.uw.edu' + asset.file_url
          : 'https://rapid2.apl.uw.edu' + asset.file_url;

      $('#embedded-asset-viewer-container .embeddedAssetImg').css('background-image', 'none');
      url = url.replace('(', '%28').replace(')', '%29');
      // console.log(url)
      $('#embedded-asset-viewer-container .embeddedAssetImg').css('background-image', 'url(' + url + ')');
      map.invalidateSize();
    };

    show_embedded_asset(question_uuid, asset_uuid);

    // only draw question with embedded asset

    if (!Questionnaires.EMBEDDED_ASSET_PANEL_OPEN) {
      Questionnaires.EMBEDDED_ASSET_PANEL_OPEN = true;
      Utils.getModal(modal_id, 'fade');
      $(embedded_asset_viewer).fadeIn();
      map.invalidateSize();
    }
  }

  // createAssetViewerHeaderRow() {}
  createAssetViewerTableRow(questionnaire_asset) {
    let questionnaire = this;
    let asset = questionnaire_asset;
    let viewer = this.questionnaire_asset_viewer;
    let project_name = Assets.projectMap[asset.project_uuid]
      ? Assets.projectMap[asset.project_uuid].title
      : asset.project_uuid
        ? asset.project_uuid
        : '';
    let date = asset._timestamp ? Utils.getAssetViewerDateString(new Date(asset._timestamp * 1000)) : '';

    // project name and date rows
    if (Parameters.deployment === 'live') {
      this.table_cells = [
        { tag: 'td', children: [{ tag: 'p', html: project_name }] },
        { tag: 'td', children: [{ tag: 'p', html: date }] },
        {
          tag: 'td',
          children: [
            {
              tag: 'button',
              label: SVG.getEyeIcon(),
              style: ['buttonEditItems', 'margin10'],
              up_action: function () {
                questionnaire.viewCompletedQuestionnaire();
              },
            },
          ],
        },
      ];
    } else {
      this.table_cells = [
        { tag: 'td', children: [{ tag: 'p', html: project_name }] },
        { tag: 'td', children: [{ tag: 'p', html: date }] },
        {
          tag: 'td',
          children: [
            {
              tag: 'button',
              label: SVG.getEyeIcon(),
              style: ['buttonEditItems'],
              up_action: function () {
                questionnaire.viewCompletedQuestionnaire();
              },
            },
          ],
        },
        {
          tag: 'td',
          children: [
            {
              tag: 'button',
              label: SVG.getPencil(),
              style: ['buttonEditItems'],
              up_action: function () {
                questionnaire.editCompletedQuestionnaire();
              },
            },
          ],
        },
      ];
    }

    for (let section of this.sections) {
      for (let question of section.questions) question.getAssetViewerTableCell();
    }

    return this.table_cells;
  }

    /** Method for generating read only questionnaire **/
    renderView() {
        const questionnaire = this;

        // add a section, then add all questions in section
        let section_list_item;
        const container = DOM.new({
            tag: 'div',
            class: 'view-only-questionnaire-container',
        });
        for (const section of questionnaire.sections) {
            section_list_item = $(section.view_question_DOM).clone();
            $(section_list_item).find('p.goto-label').parent().remove();
            $(section_list_item).appendTo(container);
            for (const question of section.questions) {
                question.drawViewResponse(container);
            }
        }
        return container;
    }

  viewCompletedQuestionnaire() {
    let questionnaire = this;
    let form = $('#completed-questionnaire-view-form');
    let label = 'Done Viewing';

    // show a questionnaire that has been filled out with answers
    // modify our edit form

    if (!form.length) {
      form = DOM.new({
        tag: 'div',
        id: 'completed-questionnaire-view-form',
        click: function () {
          $(form).find('.single-select-dropdown-menu').addClass('hidden');
        },
        class: 'modalForm hideScrollBar questionnaireFormContainer view-questionnaire',
        parent: $('#questionnaire-viewer-container'),
        children: [
          { tag: 'div', class: 'reorderQuestionContainer assetViewerQuestionContainer' },
          {
            tag: 'div',
            class: 'questionReorderControlBar',
            children: [{ tag: 'button', label: 'Done Editing', class: 'buttonDone' }],
          },
        ],
      });
    }

    $(form)
      .find('.buttonDone')
      .html(label)
      .unbind()
      .click(function () {
        $(this).parent().parent().fadeOut();
        Utils.fadeOutPrimaryModal();
        questionnaire.questionnaire_asset_viewer.getAssetTable();
      });

    let container = $(form).find('.assetViewerQuestionContainer');
    $(container).empty();

    // questionnaire title element
    DOM.new({ tag: 'p', class: 'questionText centerText', html: questionnaire.name, parent: container });

    let section_list_item = null;

    for (let section of this.sections) {
      section_list_item = $(section.view_question_DOM).clone();
      $(section_list_item).find('p.goto-label').parent().remove();
      if (!section.heading) $(section_list_item).find('p.headingText').remove();
      $(section_list_item).appendTo(container);
      for (let question of section.questions) question.drawViewResponse(container);
    }

    // once we add our question, we have to
    // remove editing controls from form since we are viewing a read-only state

    $(form).find('.buttonDecline').parent().hide();
    Utils.fadeInPrimaryModal();
    $(form).fadeIn();
    $(form).find('.assetViewerQuestionContainer').scrollTop(0);
  }

  editCompletedQuestionnaire(question_uuid) {
    //show editable questionnaire form to edit answers in the asset viewer table

    let questionnaire = this;
    let label = 'Done Editing';
    let form = $('#completed-questionnaire-edit-form');
    $(form).removeClass('view-questionnaire');

    if (!form.length) {
      form = DOM.new({
        tag: 'div',
        id: 'completed-questionnaire-edit-form',
        click: function () {
          $(form).find('.single-select-dropdown-menu').addClass('hidden');
        },
        class: 'modalForm hideScrollBar questionnaireFormContainer',
        parent: $('#questionnaire-viewer-container'),
        children: [
          { tag: 'div', class: 'reorderQuestionContainer assetViewerQuestionContainer hideScrollBar' },
          { tag: 'div', class: 'questionReorderControlBar', children: [{ tag: 'button', label: 'Done', class: 'buttonDone' }] },
        ],
      });
    }

    $(form).find('.buttonDone').unbind();
    $(form).find('.buttonDone').html(label);
    $(form)
      .find('.buttonDone')
      .click(function () {
        $(this).parent().parent().fadeOut();
        Utils.fadeOutPrimaryModal();
        questionnaire.questionnaire_asset_viewer.getAssetTable();
      });

    let container = $(form).find('.assetViewerQuestionContainer');
    $(container).empty();

    // questionnaire title element
    DOM.new({ tag: 'p', class: 'questionText centerText', html: questionnaire.name, parent: container });

    let section_list_item = null;

    for (let section of this.sections) {
      section_list_item = $(section.view_question_DOM);
      $(section_list_item).find('p.goto-label').parent().remove();
      $(section_list_item).appendTo(container);
      for (let question of section.questions) question.drawEditableResponse(container);
    }

    Utils.fadeInPrimaryModal();
    $(form).fadeIn();

    //if a question uuid passed in, scroll form container to question
    if (question_uuid) {
      // console.log(question_uuid)
      let question = questionnaire.getItemById(question_uuid);
      if (question) {
        let view = question.view_question_DOM;
        let top = $(view).prop('offsetTop');
        $(form).children('.assetViewerQuestionContainer ').scrollTop(top);
      }
    } else {
      // scroll to top of form if no specific question selected
      $(form).find('.assetViewerQuestionContainer').scrollTop(0);
    }
  }

  getInfo() {
    let template = this;

    $('.questionScrollIcon, .headerScrollIcon, .sectionScrollIcon, .iconActive').removeClass('iconActive');
    $('.sectionScrollIconActive').removeClass('sectionScrollIconActive');
    $('#button-previous-question').addClass('disabled');
    $('#button-next-question, #button-add-question').removeClass('disabled');
    $('#intro-scroll-icon').addClass('iconActive');

    if (!this.info_page) {
      this.info_page = DOM.new({
        tag: 'div',
        class: 'wrapper',
        children: [
          {
            tag: 'div',
            class: 'wrapperNoPad alignLeft',
            children: [
              { tag: 'p', class: 'questionnaireInfoHeader', html: 'Name' },
              { tag: 'p', id: 'questionnaire-' + template.id + '-name-field', class: 'questionnaireInfo', html: this.name },
            ],
          },
          {
            tag: 'div',
            class: 'wrapperNoPad alignLeft',
            children: [
              { tag: 'p', class: 'questionnaireInfoHeader', html: 'Description' },
              {
                tag: 'p',
                id: 'questionnaire-' + template.id + '-description-field',
                class: 'questionnaireInfo',
                html: this.description,
              },
            ],
          },
          {
            tag: 'div',
            class: 'wrapperNoPad alignLeft',
            children: [
              { tag: 'p', class: 'questionnaireInfoHeader', html: 'Display Mode' },
              { tag: 'p', class: 'questionnaireDetailText indentSmall displayMode', html: template.display_mode },
            ],
          },

          {
            tag: 'div',
            class: 'wrapperNoPad alignLeft',
            children: [
              { tag: 'p', class: 'questionnaireInfoHeader', html: 'Editable' },
              { tag: 'p', class: 'questionnaireDetailText indentSmall editable', html: template.editable },
            ],
          },
          {
            tag: 'div',
            class: 'wrapperNoPad alignLeft allowBackWrapper',
            children: [
              { tag: 'p', class: 'questionnaireInfoHeader', html: 'Allow Back' },
              { tag: 'p', class: 'questionnaireDetailText indentSmall allowBack', html: template.allow_back },
            ],
          },
          {
            tag: 'div',
            class: 'wrapperNoPad alignLeft defaultRequiredWrapper',
            children: [
              { tag: 'p', class: 'questionnaireInfoHeader', html: 'Required' },
              { tag: 'p', class: 'questionnaireDetailText indentSmall requiredDefault', html: template.required_default },
            ],
          },
          {
            tag: 'div',
            class: 'wrapperNoPad alignLeft assetEmbeddingWrapper',
            children: [
              { tag: 'p', class: 'questionnaireInfoHeader', html: 'Asset Embedding' },
              { tag: 'p', class: 'questionnaireDetailText indentSmall assetEmbedding', html: template.asset_embedding },
            ],
          },
        ],
      });

      this.edit_info_page = DOM.new({
        tag: 'div',
        class: 'wrapper',
        children: [
          {
            tag: 'div',
            class: 'wrapperNoPad alignLeft',
            children: [
              { tag: 'p', class: 'questionnaireInfoHeader', html: 'Name' },
              {
                tag: 'input',
                class: 'shortAnswer',
                value: this.name,
                keyup: function () {
                  if (this.update_timer !== null) clearTimeout(this.update_timer);
                  let value = $(this).val();
                  $(template.info_page)
                    .find('#questionnaire-' + template.id + '-name-field')
                    .html(value);
                  this.update_timer = setTimeout(function () {
                    template.name = value;
                    $(template.info_page)
                      .find('#questionnaire-' + template.id + '-name-field')
                      .html(value);
                    template.save();
                  }, 450);
                },
              },
            ],
          },
          {
            tag: 'div',
            class: 'wrapperNoPad alignLeft',
            children: [
              { tag: 'p', class: 'questionnaireInfoHeader', html: 'Description' },
              {
                tag: 'input',
                class: 'shortAnswer',
                value: this.description,
                keyup: function () {
                  if (this.update_timer !== null) clearTimeout(this.update_timer);
                  let value = $(this).val();
                  $(template.info_page)
                    .find('#questionnaire-' + template.id + '-description-field')
                    .html(value);
                  this.update_timer = setTimeout(function () {
                    template.description = value;
                    $(template.info_page)
                      .find('#questionnaire-' + template.id + '-description-field')
                      .html(value);
                    template.save();
                  }, 450);
                },
              },
            ],
          },

          //multi page
          {
            tag: 'div',
            class: 'wrapperNoPad alignLeft',
            children: [
              { tag: 'p', class: 'questionnaireInfoHeader', html: 'Display Mode' },
              {
                tag: 'div',
                class: 'inlineContainer clickable',
                children: [
                  { tag: 'button', class: 'radioButtonQuestionnaire multiPage' },
                  { tag: 'p', class: 'questionnaireDetailText', html: 'Multiple Pages' },
                ],
                click: function () {
                  $(this).parent().find('.radioButtonActive').removeClass('radioButtonActive');
                  $(this).find('.radioButtonQuestionnaire').addClass('radioButtonActive');
                  $(this).addClass('unclickable').removeClass('clickable');
                  $(this).next().removeClass('unclickable').addClass('clickable');
                  template.display_mode = 'multi';
                  $(template.info_page).find('.displayMode').html('Multiple Pages');
                  $(template.info_page).find('.allowBackWrapper').removeClass('disabled');
                  $(template.edit_info_page).find('.allowBackWrapper').removeClass('disabled');
                  template.save();
                },
              },

              //single page
              {
                tag: 'div',
                class: 'inlineContainer clickable',
                children: [
                  { tag: 'button', class: 'radioButtonQuestionnaire singlePage' },
                  { tag: 'p', class: 'questionnaireDetailText', html: 'Single Page' },
                ],
                click: function () {
                  $(this).parent().find('.radioButtonActive').removeClass('radioButtonActive');
                  $(this).find('.radioButtonQuestionnaire').addClass('radioButtonActive');
                  $(this).addClass('unclickable').removeClass('clickable');
                  // $(this).parent().next().find(".inlineContainer").addClass("unclickable").removeClass("clickable");

                  $(template.info_page).find('.allowBackWrapper').addClass('disabled');
                  $(template.edit_info_page).find('.allowBackWrapper').addClass('disabled');

                  $(this).prev().removeClass('unclickable').addClass('clickable');
                  template.display_mode = 'single';
                  $(template.info_page).find('.displayMode').html('Single Page');
                  template.save();
                },
              },
            ],
          },

          //allow back
          {
            tag: 'div',
            class: 'wrapperNoPad alignLeft allowBackWrapper',
            children: [
              { tag: 'p', class: 'questionnaireInfoHeader', html: 'Allow Back' },
              {
                tag: 'div',
                class: 'inlineContainer clickable',
                children: [
                  { tag: 'button', class: 'radioButtonQuestionnaire allowBackTrue' },
                  { tag: 'p', class: 'questionnaireDetailText', html: 'Yes' },
                ],
                click: function () {
                  $(this).parent().find('.radioButtonActive').removeClass('radioButtonActive');
                  $(this).find('.radioButtonQuestionnaire').addClass('radioButtonActive');
                  $(this).addClass('unclickable').removeClass('clickable');
                  $(this).parent().next().removeClass('disabled');
                  $(this).next().removeClass('unclickable').addClass('clickable');
                  template.allow_back = true;
                  $(template.info_page).find('.allowBack').html('Yes');
                  template.save();
                },
              },

              {
                tag: 'div',
                class: 'inlineContainer clickable',
                children: [
                  { tag: 'button', class: 'radioButtonQuestionnaire allowBackFalse' },
                  { tag: 'p', class: 'questionnaireDetailText', html: 'No' },
                ],
                click: function () {
                  $(this).parent().find('.radioButtonActive').removeClass('radioButtonActive');
                  $(this).find('.radioButtonQuestionnaire').addClass('radioButtonActive');
                  $(this).addClass('unclickable').removeClass('clickable');
                  $(this).parent().next().removeClass('disabled');
                  $(this).prev().removeClass('unclickable').addClass('clickable');
                  template.allow_back = false;
                  $(template.info_page).find('.allowBack').html('No');
                  template.save();
                },
              },
            ],
          },

          //asset embedding
          {
            tag: 'div',
            class: 'wrapperNoPad alignLeft assetEmbeddingWrapper',
            children: [
              { tag: 'p', class: 'questionnaireInfoHeader', html: '' },
              {
                tag: 'div',
                class: 'inlineContainer clickable',
                children: [
                  { tag: 'button', class: 'radioButtonQuestionnaire assetEmbeddingTrue' },
                  { tag: 'p', class: 'questionnaireDetailText', html: 'Yes' },
                ],
                click: function () {
                  $(this).parent().find('.radioButtonActive').removeClass('radioButtonActive');
                  $(this).find('.radioButtonQuestionnaire').addClass('radioButtonActive');
                  $(this).addClass('unclickable').removeClass('clickable');
                  $(this).parent().next().removeClass('disabled');
                  $(this).next().removeClass('unclickable').addClass('clickable');
                  template.asset_embedding = true;
                  $(template.info_page).find('.assetEmbedding').html('Yes');
                  template.save();
                },
              },

              {
                tag: 'div',
                class: 'inlineContainer clickable',
                children: [
                  { tag: 'button', class: 'radioButtonQuestionnaire assetEmbeddingFalse' },
                  { tag: 'p', class: 'questionnaireDetailText', html: 'No' },
                ],
                click: function () {
                  $(this).parent().find('.radioButtonActive').removeClass('radioButtonActive');
                  $(this).find('.radioButtonQuestionnaire').addClass('radioButtonActive');
                  $(this).addClass('unclickable').removeClass('clickable');
                  $(this).parent().next().removeClass('disabled');
                  $(this).prev().removeClass('unclickable').addClass('clickable');
                  template.asset_embedding = false;
                  $(template.info_page).find('.assetEmbedding').html('No');
                  template.save();
                },
              },
            ],
          },

          //required default
          {
            tag: 'div',
            class: 'wrapperNoPad alignLeft defaultRequiredWrapper',
            children: [
              { tag: 'p', class: 'questionnaireInfoHeader', html: 'Required' },
              {
                tag: 'div',
                class: 'inlineContainer clickable',
                children: [
                  { tag: 'button', class: 'radioButtonQuestionnaire defaultRequiredWrapperTrue' },
                  { tag: 'p', class: 'questionnaireDetailText', html: 'True' },
                ],
                click: function () {
                  $(this).parent().find('.radioButtonActive').removeClass('radioButtonActive');
                  $(this).find('.radioButtonQuestionnaire').addClass('radioButtonActive');
                  $(this).addClass('unclickable').removeClass('clickable');
                  $(this).parent().next().removeClass('disabled');
                  $(this).next().removeClass('unclickable').addClass('clickable');
                  template.required_default = true;
                  $(template.info_page).find('.requiredDefault').html('True');
                  template.save();
                },
              },

              {
                tag: 'div',
                class: 'inlineContainer clickable',
                children: [
                  { tag: 'button', class: 'radioButtonQuestionnaire defaultRequiredWrapperFalse' },
                  { tag: 'p', class: 'questionnaireDetailText', html: 'False' },
                ],
                click: function () {
                  $(this).parent().find('.radioButtonActive').removeClass('radioButtonActive');
                  $(this).find('.radioButtonQuestionnaire').addClass('radioButtonActive');
                  $(this).addClass('unclickable').removeClass('clickable');
                  $(this).parent().next().removeClass('disabled');
                  $(this).prev().removeClass('unclickable').addClass('clickable');
                  template.required_default = false;
                  $(template.info_page).find('.requiredDefault').html('False');
                  template.save();
                },
              },
            ],
          },
        ],
      });

      //set button settings for info page
      if (template.allow_back === false) {
        $(template.info_page).find('.allowBack').html('No');
        $(template.edit_info_page).find('.allowBackFalse').addClass('radioButtonActive');
      } else {
        $(template.info_page).find('.allowBack').html('Yes');
        $(template.edit_info_page).find('.allowBackTrue').addClass('radioButtonActive');
      }

      if (template.display_mode === 'single') {
        $(template.info_page).find('.displayMode').html('Single Page');
        $(template.edit_info_page).find('.singlePage').addClass('radioButtonActive');
        $(template.info_page).find('.allowBackWrapper').addClass('disabled');
        $(template.edit_info_page).find('.allowBackWrapper').addClass('disabled');
      } else {
        $(template.info_page).find('.displayMode').html('Multiple Pages');
        $(template.edit_info_page).find('.multiPage').addClass('radioButtonActive');
      }

      if (template.asset_embedding === false) {
        $(template.info_page).find('.assetEmbedding').html('False');
        $(template.edit_info_page).find('.assetEmbeddingWrapperFalse').addClass('radioButtonActive');
      } else {
        $(template.info_page).find('.assetEmbedding').html('True');
        $(template.edit_info_page).find('.assetEmbeddingWrapperTrue').addClass('radioButtonActive');
      }

      if (template.required_default === false) {
        $(template.info_page).find('.requiredDefault').html('False');
        $(template.edit_info_page).find('.defaultRequiredWrapperFalse').addClass('radioButtonActive');
      } else {
        $(template.info_page).find('.requiredDefault').html('True');
        $(template.edit_info_page).find('.defaultRequiredWrapperTrue').addClass('radioButtonActive');
      }
    }

    //navigate to info page
    $('#questionnaire-view-template').children().not('.newQuestionModalForm').remove();
    if (this.edit_mode) {
      $(this.edit_info_page).appendTo($('#questionnaire-view-template'));
    } else {
      $(this.info_page).appendTo($('#questionnaire-view-template'));
    }
    this.current_question_index = -1;
    this.section_index = -1;
  }

  getEnd() {
    let template = this;

    $('#button-next-question').addClass('disabled');
    $('#button-previous-question').removeClass('disabled');
    $('#button-add-question').addClass('disabled');
    $('.questionScrollIcon, .headerScrollIcon, .sectionScrollIcon, .iconActive').removeClass('iconActive');
    $('.sectionScrollIconActive').removeClass('sectionScrollIconActive');
    $('#end-scroll-icon').addClass('iconActive');

    if (!this.end_page) {
      this.end_page = DOM.new({
        tag: 'div',
        class: 'wrapper',
        children: [
          {
            tag: 'div',
            class: 'wrapper',
            style: 'text-align: left; padding: 0;',
            children: [
              { tag: 'p', class: 'questionnaireInfoHeader', html: 'Exit Poll' },
              {
                tag: 'p',
                id: 'questionnaire-' + template.id + '-description-field',
                class: 'questionnaireInfo',
                html: template.end_text,
              },
            ],
          },
        ],
      });

      this.edit_end_page = DOM.new({
        tag: 'div',
        class: 'wrapper',
        children: [
          {
            tag: 'div',
            class: 'wrapper',
            style: 'text-align: left; padding: 0;',
            children: [
              { tag: 'p', class: 'questionnaireInfoHeader', html: 'Exit Poll' },

              {
                tag: 'textarea',
                class: 'questionHeading',
                html: template.end_text,
                keyup: function () {
                  if (template.update_timer !== null) clearTimeout(template.update_timer);
                  let value = $(this).val();
                  template.update_timer = setTimeout(function () {
                    template.end_text = value;
                    $(template.end_page).find('.questionnaireInfo').html(value);
                    template.save(true);
                  }, 300);
                },
                blur: function () {
                  if (template.update_timer !== null) clearTimeout(template.update_timer);
                  let value = $(this).val();
                  template.end_text = value;
                  $(template.end_page).find('.questionnaireInfo').html(value);
                  template.save(true);
                },
              },
            ],
          },
        ],
      });
    }

    this.section_index = this.sections.length;
    this.current_question_index = -1;

    //navigate to info page
    $('#questionnaire-view-template').children().not('.newQuestionModalForm').remove();
    if (this.edit_mode) {
      $(this.edit_end_page).appendTo($('#questionnaire-view-template'));
    } else {
      $(this.end_page).appendTo($('#questionnaire-view-template'));
    }
  }

  getSections() {
    let template = this;
    let callback = function (response_text) {
      let response = JSON.parse(response_text);
      //template properties
      //these are not database columns, but are found in questionnaire template payload

      template.errors = response.questionnaire.errors;
      template.end_text = response.questionnaire.end_text;
      template.end_uuid = response.questionnaire.end_uuid;
      template.allow_back = response.questionnaire.allow_back;
      template.display_mode = response.questionnaire.display_mode;
      template.required_default = response.questionnaire.required_default;
      template.editable =
        response.questionnaire.editable !== undefined ? response.questionnaire.editable : Questionnaires.EDITABLE_DEFAULT;
      template.asset_embedding =
        response.questionnaire.asset_embedding !== undefined
          ? response.questionnaire.asset_embedding
          : Questionnaires.ASSET_EMBEDDING_DEFAULT;

      for (let section of response.questionnaire.sections) new Section(template, section, false);

      template.addSectionGoTos();
      template.loaded = true;
      template.view();
      // $(template.list_item).find(".buttonQuestionnaireView, .buttonQuestionnaireEdit, .buttonQuestionnaireCopy").removeClass("disabled");
    };
    Ajax.doGet(Questionnaires.url + this.id, callback);
  }
  //UI method
  // view() {
  //
  //     let template = this;
  //
  //     if (template.loaded) {
  //
  //         this.getInfo();
  //
  //         $(".viewerContainer").show();
  //         $("#questionnaire-edit-form").css("transform", "translate(-100%)").hide();
  //         $("#button-public-questionnaires").hide();
  //         $("#button-edit-questionnaire, #button-delete-questionnaire, #button-share-questionnaire").removeClass("hidden");
  //
  //
  //         $("#button-edit-questionnaire, #button-delete-questionnaire, #button-share-questionnaire").show();
  //         $("#questionnaire-viewer").css("transform", "translate(-100%)");
  //         $("#questionnaire-viewer").children(".modalForm").addClass("disabled");
  //
  //         $("#questionnaire-view-template").empty();
  //         $("#questionnaire-label").html(template.name);
  //         $(".headerBackArrowIcon").fadeIn(300);
  //         $(".headerBackArrowIcon, #confirm-delete-questionnaire-button, #confirm-delete-question-button, #button-show-branching").unbind();
  //         $(".currentItems").unbind();
  //
  //         if (template.edit_mode) {
  //             //toggle between edit mode
  //             $("#button-edit-questionnaire").addClass("buttonEditItemsSelected");
  //             $("#button-edit-questionnaire").children("svg").addClass("sectionEditButtonSvgSelected");
  //             $("#button-edit-questionnaire").removeClass("disabled");
  //             $("#button-reorder-questions, #button-add-question, .button-show-branching").removeClass("hidden");
  //
  //         } else {
  //             $("#button-reorder-questions, #button-add-question").addClass("hidden");
  //             $("#button-edit-questionnaire").removeClass("buttonEditItemsSelected");
  //             $("#button-edit-questionnaire").children("svg").removeClass("sectionEditButtonSvgSelected");
  //         }
  //
  //         //delete actions
  //         $("#confirm-delete-questionnaire-button").click(function() {
  //             template.deleteTemplate();
  //         });
  //
  //         $(".buttonDeleteSection").click(function () {
  //
  //             if ($("#delete-section-form").find(".radioButton").last().hasClass("radioButtonActive")) {
  //                 if (template.section_to_move_to) template.moveSectionQuestion(template.section_to_move_to)
  //             }
  //             setTimeout(template.deleteSection(), 200);
  //         });
  //
  //         $("#confirm-delete-question-button").unbind();
  //         $("#confirm-delete-question-button").click(function () {
  //             template.deleteQuestion();
  //         });
  //
  //
  //         //bind the prev, next question buttons
  //         $("#button-reorder-questions, #button-previous-question, #button-next-question, #button-add-question, " +
  //             "#button-edit-questionnaire, .currentItems, .headerBackArrowIcon, #intro-scroll-icon").unbind();
  //
  //         //edit button
  //         $("#button-edit-questionnaire").click(function () {
  //             template.toggleView()
  //         });
  //
  //         $("#button-previous-question").click(function () {
  //
  //             //on end page
  //             if (template.section_index === template.sections.length) {
  //                 template.section_index--;
  //                 template.current_question_index = template.sections[template.section_index].questions.length - 1;
  //                 template.changeQuestion();
  //                 return;
  //
  //             }
  //
  //             if (template.current_question_index === -1) {
  //                 if (template.section_index === 0) {
  //                     template.getInfo();
  //                     return;
  //                 }
  //                 template.section_index--;
  //                 template.current_question_index = template.sections[template.section_index].questions.length - 1;
  //             } else {
  //                 template.current_question_index--;
  //             }
  //             template.changeQuestion()
  //         });
  //
  //         $("#button-next-question").click(function () {
  //
  //             //on info page
  //             if (template.section_index === -1) {
  //                 template.section_index++;
  //                 template.current_question_index = -1;
  //                 template.changeQuestion();
  //                 return;
  //             }
  //
  //             if (template.current_question_index === (template.getCurrentSection().questions.length - 1)) {
  //                 if (template.section_index === template.sections.length) {
  //                     template.getEnd();
  //                     return;
  //                 }
  //                 template.section_index++;
  //                 template.current_question_index = -1;
  //             } else {
  //                 template.current_question_index++;
  //             }
  //             template.changeQuestion();
  //         });
  //
  //         //bind new question button
  //         $("#button-add-question").click(function () {
  //             template.addNewItem();
  //         });
  //
  //         //intro
  //         $("#intro-scroll-icon").click(function () {
  //             // template.current_question_index = -1;
  //             // template.changeQuestion();
  //             template.getInfo();
  //             $(".sectionScrollIconActive").removeClass("sectionScrollIconActive");
  //         });
  //
  //         //outro
  //         $("#end-scroll-icon").click(function () {
  //             // template.current_question_index = template.questions.length;
  //             // template.changeQuestion();
  //             template.getEnd();
  //             $(".sectionScrollIconActive").removeClass("sectionScrollIconActive");
  //         });
  //
  //         //bind reorder question button
  //         $("#button-reorder-questions").click(function () {
  //
  //             $(template.reorder_question_form).removeClass("disabled");
  //             $(template.reorder_question_form).fadeIn();
  //
  //             // $.each($(template.reorder_question_form).find(".reorderSectionListItem"), function (index, value) {
  //             //     $(value).height($(value).prop("scrollHeight"));
  //             // });
  //
  //             $.each($(".reorderSectionListItem"), function (index, value) {
  //
  //                 if ($(value).find(".indent").children().length) {
  //                     let height = $(value).children(".wrapperNoPad").height() + 56;
  //                     $(value).height(height);
  //                     $(value).find(".indent").css("padding-bottom", "10px")
  //
  //                 } else {
  //                     $(value).find(".indent").css("padding-bottom", "44px")
  //                 }
  //             });
  //
  //             template.makeSortable();
  //
  //             $("#questionnaire-modal").fadeIn();
  //         });
  //
  //         //bind reorder question button
  //         $("#button-show-branching").click(function () {
  //
  //             $(template.branching_form).removeClass("disabled");
  //             $(template.branching_form).fadeIn();
  //             $("#questionnaire-modal").fadeIn();
  //             $(".question-flow-info-panel").hide();
  //             template.updateItemCount();
  //             template.drawBranches();
  //
  //
  //         });
  //
  //         $(".currentItems, .headerBackArrowIcon").click(function () {
  //             $("#questionnaire-modal").hide();
  //             $(template.branching_form).hide();
  //             $("#button-edit-questionnaire, #button-delete-questionnaire, #button-share-questionnaire").addClass("hidden");
  //             $("#button-edit-questionnaire, #button-delete-questionnaire, #button-share-questionnaire").hide();
  //             $("#questionnaire-label").html("");
  //             template.resizeItems(false);
  //             Content.exitViewer()
  //         });
  //
  //         if (template.current_question_index === -1) {
  //             template.changeQuestion();
  //         } else {
  //             if (template.questions[template.current_question_index]) {
  //                 if ($(template.questions[template.current_question_index].view_question_DOM))
  //                     $(template.questions[template.current_question_index].view_question_DOM).appendTo($("#questionnaire-view-template"));
  //             }
  //         }
  //
  //         // template.getItems();
  //
  //         //scroll bar icons
  //         $("#question-scroll-bar").children().not("#intro-scroll-icon, #end-scroll-icon").remove();
  //         $("#question-scroll-bar").find(".sectionScrollContainer").remove();
  //         $("#select-goto-scroll-bar").children().not(".endIcon, .infoIcon").remove();
  //
  //
  //
  //         $(".iconActive").not("#intro-scroll-icon").removeClass("iconActive");
  //
  //         // for (let section of template.sections) {
  //         //     for (let question of section.questions) {
  //         //         // if (question.constructor.name === "SingleAnswer2") question.updateGoTos();
  //         //         question.updateEmptyFields();
  //         //     }
  //         // }
  //
  //         //todo check if this messes anything up
  //         // template.updateItemCount();
  //
  //         this.resizeItems(true);
  //
  //         setTimeout(function () {
  //
  //             for (let item of template.sections) {
  //                 if (item.scroll_icon) {
  //                     let icon1 = $(item.scroll_icon).clone();
  //                     $(item.scroll_icon).insertBefore($("#question-scroll-bar").find("#end-scroll-icon"));
  //                     $(icon1).insertBefore($("#select-goto-scroll-bar").children().last());
  //                 }
  //             }
  //         }, 5)
  //
  //         setTimeout(function () {
  //             $("#intro-scroll-icon").click();
  //         }, 200);
  //
  //     } else {
  //
  //         if (template.id) template.getSections();
  //     }
  // }

  getItemById(id) {
    if (this.question_id_map[id]) {
      return this.question_id_map[id];
    } else {
      for (let section of this.sections) {
        if (section.id === id) return section;

        for (let question of section.questions) {
          if (question.id === id) return question;
        }
      }

      // let has_sub_questions = ["SingleAnswer2", "MultiAnswer2", "YesNo2"]
      // //check for sub question
      // for (let section of this.sections) {
      //     for (let question of section.questions.filter(question => has_sub_questions.includes(question.constructor.name))) {
      //         for (let option of question.options) {
      //             if (option.sub_question) if (option.sub_question.id === id) return option.sub_question;
      //         }
      //     }
      // }
    }
    return null;
  }

  updateItemCount() {}

  save() {}
}


/** Editable, buildable questionnaire template object **/

class QuestionnaireTemplate {
  constructor(metadata, is_new, is_copy) {
    //add metadata
    let template = this;

    template.edit_mode = false;
    template.sections_expanded = true;
    template.num_questions = 0;
    template.current_question_number;
    template.section_index = -1;
    template.current_question_index = -1;
    template.sections = [];
    template.items = [];
    template.section_to_move_to = null;
    template.loaded = false;
    template.is_copy = is_copy;

    //maps question number to question object
    template.question_map = {};
    template.question_id_map = {};
    template.section_id_map = {};

    //question flow
    template.question_flow_active_question = null;

    //template save timer
    template.save_timer = null;

    for (let property in metadata) template[property] = metadata[property];

    if (metadata.errors) template.errors = JSON.parse(metadata.errors);

    //list item
    let DOM_id = 'questionnaire-template-' + template.id;
    let html = SVG.getCloudIconGreyQuestionnaires();

    //red error label
    let error_label = !template.errors ? null : template.errors.length > 1 ? 'Problems Detected' : 'Problem Detected';
    let errors_class = !template.errors
      ? null
      : template.errors.length > 1
        ? 'questionnaire-list-item-errors-label'
        : 'questionnaire-list-item-error-label';
    let error_label_DOM = template.errors ? { tag: 'div', class: errors_class, html: error_label } : null;

    let description_class = template.description ? 'listItemLabel' : 'listItemLabel hidden';

    // private questionnaires
    if (template.owner === Content.user) {
      if (template.access === 'public') html = SVG.getCloudIconBlackQuestionnaires();
      let list_item_access_row = [{ tag: 'div', id: DOM_id + '-access-icon', class: 'QuestionnaireAccess', html: html }];
      if (is_copy) {
        list_item_access_row.push(
          { tag: 'p', class: 'hidden', html: 'Up to date.' },
          {
            tag: 'div',
            class: 'button-questionnaire-update',
            html: 'Update',
            click: function (e) {
              template.showUpdateForm(e);
            },
            parent: $(template.list_item).find('.questionnaire-list-item-access-row'),
          }
        );
      }

      template.list_item = DOM.new({
        tag: 'div',
        id: DOM_id,
        class: 'questionnaire-list-item',
        parent: $('#questionnaires'),
        children: [
          {
            tag: 'div',
            children: [
              { tag: 'p', id: DOM_id + '-label', class: 'listItemTitle', html: template.name },
              { tag: 'p', id: DOM_id + '-owner', class: 'listItemLabel', html: template.owner },
              { tag: 'p', id: DOM_id + '-description', class: description_class, html: template.description },
              error_label_DOM,
              { tag: 'div', class: 'questionnaire-list-item-access-row', children: list_item_access_row },
            ],
          },

          {
            tag: 'div',
            children: [
              {
                tag: 'button',
                class: 'button-questionnaire-list-item',
                label: 'View',
                up_action: function (e) {
                  e.stopPropagation();
                  template.edit_mode = false;
                  template.view(true);
                },
              },
              {
                tag: 'button',
                class: 'button-questionnaire-list-item',
                label: 'Edit',
                up_action: function (e) {
                  e.stopPropagation();
                  template.edit_mode = true;
                  template.view(true);
                },
              },
              {
                tag: 'button',
                class: 'button-questionnaire-list-item',
                label: 'Copy',
                up_action: function (e) {
                  e.stopPropagation();
                  template.showCopyForm();
                },
              },
            ],
          },
        ],
        click: function () {
          template.edit_mode = false;
          template.view(!template.loaded);
        },
      });
    } else {
      // public questionnaires are not added to the local questionnaire list view
      // they are stored in a drop down list and can be copied to the local list view by the user

      template.drop_down_list_item = DOM.new({
        tag: 'tr',
        id: DOM_id,
        parent: $('.public-questionnaires-dropdown .dropDownListTable'),
        children: [
          { tag: 'td', children: [{ tag: 'p', class: 'tableValue', html: template.name }] },
          { tag: 'td', children: [{ tag: 'p', class: 'tableExtra usernameField', html: template.owner }] },
          {
            tag: 'td',
            children: [
              {
                tag: 'button',
                class: 'buttonCopy',
                label: 'Copy',
                up_action: function () {
                  template.showCopyForm();
                  // template.copy();
                },
              },
            ],
          },
        ],
      });
    }

    //reorder question form
    template.reorder_question_form = DOM.new({
      tag: 'div',
      id: 'questionnaire-' + template.id + '-reorder-form',
      class: 'modalForm hideScrollBar',
      parent: $('#questionnaire-viewer'),
      children: [
        {
          tag: 'div',
          class: 'reorderQuestionContainer',
          children: [
            {
              tag: 'div',
              id: 'qnaire-' + template.id + '-info-section',
              class: 'wrapperNoPad introSection',
              parent: $(template.reorder_question_form).find('.reorderQuestionContainer'),
              children: [
                {
                  tag: 'div',
                  class: 'reorderSectionListItem unclickable hideScrollBar',
                  children: [
                    { tag: 'p', class: 'reorderSectionText unclickable', style: 'margin-left: 10px', html: 'Info' },
                    //todo should modify padding for section containers that have children. if children, reduce padding so that drop target matches up with section container!!
                  ],
                },
              ],
            },
            {
              tag: 'div',
              id: 'qnaire-' + template.id + '-end-section',
              class: 'wrapperNoPad endSection',
              parent: $(template.reorder_question_form).find('.reorderQuestionContainer'),
              children: [
                {
                  tag: 'div',
                  class: 'reorderSectionListItem unclickable hideScrollBar',
                  children: [
                    { tag: 'p', class: 'reorderSectionText unclickable', style: 'margin-left: 10px', html: 'End' },
                    //todo should modify padding for section containers that have children. if children, reduce padding so that drop target matches up with section container!!
                  ],
                },
              ],
            },
          ],
        },
        {
          tag: 'div',
          class: 'questionReorderControlBar',
          children: [
            {
              tag: 'button',
              class: 'buttonExpandAllSections',
              up_action: function () {
                $(template.reorder_question_form).find('.buttonExpandSection ').html(SVG.getBlackMinusSign());
                $.each($(template.reorder_question_form).find('.reorderSectionListItem'), function (index, value) {
                  $(value).children('.wrapperNoPad').removeClass('sectionCollapsed');
                  $(value).css('height', $(value).find('.indent').height() + 55);
                });
                template.max_scroll_top = Math.ceil(
                  $(template.reorder_question_form).find('.reorderQuestionContainer').prop('scrollHeight') -
                  $(template.reorder_question_form).find('.reorderQuestionContainer').prop('offsetHeight')
                );
                template.sections_expanded = true;
              },
              label: 'Expand All',
            },

            {
              tag: 'button',
              class: 'buttonCollapseAllSections',
              up_action: function () {
                $(template.reorder_question_form).find('.buttonExpandSection ').html(SVG.getBlackPlusSign());
                $.each($(template.reorder_question_form).find('.reorderSectionListItem'), function (index, value) {
                  $(value).children('.wrapperNoPad').addClass('sectionCollapsed');
                  $(value).css('height', 'auto');
                  //todo hide wrapper no pad
                });

                template.max_scroll_top = Math.ceil(
                  $(template.reorder_question_form).find('.reorderQuestionContainer').prop('scrollHeight') -
                  $(template.reorder_question_form).find('.reorderQuestionContainer').prop('offsetHeight')
                );
                template.sections_expanded = false;
              },
              label: 'Collapse All',
            },

            {
              tag: 'button',
              label: 'Done',
              class: 'buttonDone',
              up_action: function () {
                $(this).parent().parent().fadeOut();
                $('#questionnaire-modal').fadeOut();
              },
            },
          ],
        },
      ],
    });

    //branching form
    template.branching_form = DOM.new({
      tag: 'div',
      id: 'questionnaire-' + template.id + '-branching-form',
      class: 'modalForm hideScrollBar',
      parent: $('#questionnaire-viewer'),
      children: [
        { tag: 'div', class: 'question-flow-info-panel hideScrollBar' },
        {
          tag: 'div',
          class: 'show-branching-container hideScrollBar',
          click: function () {
            $(this).find('.branch-selected').removeClass('branch-selected');
            $(this).find('.branch-hover').removeClass('branch-hover');
            $(this).find('.branch-node-selected').removeClass('branch-node-selected');
            $(this).find('.branch-faded').removeClass('branch-faded');

            template.question_flow_active_question = null;
            $('.question-flow-info-panel').fadeOut();
          },
          children: [{ tag: 'div', class: 'question-flow-tooltip hidden hideScrollBar' }],
        },

        {
          tag: 'div',
          class: 'questionReorderControlBar',
          children: [
            {
              tag: 'button',
              label: 'Done',
              class: 'buttonDone',
              up_action: function () {
                $(this).parent().parent().fadeOut();
                $('#questionnaire-modal').fadeOut();
              },
            },
          ],
        },
      ],
    });

    //new question form
    template.new_question_form = DOM.new({
      tag: 'div',
      class: 'newQuestionModalForm',
      parent: $('#questionnaire-viewer'),
      children: [
        {
          tag: 'div',
          class: 'containerBottomBar hideScrollBar',
          children: [
            { tag: 'p', class: 'headerLabel', html: 'New Section' },
            {
              tag: 'div',
              class: 'wrapper',
              children: [
                {
                  tag: 'button',
                  class: 'buttonQuestionOption',
                  label: 'Section',
                  up_action: function () {
                    template.addItem($(this).html());
                  },
                },
              ],
            },
            { tag: 'p', class: 'headerLabel', html: 'New Question' },
            //question types
            {
              tag: 'div',
              class: 'wrapper',
              children: [
                {
                  tag: 'button',
                  class: 'buttonQuestionOption',
                  label: 'Yes / No',
                  up_action: function () {
                    $(template.new_question_form).fadeOut();
                    $('#questionnaire-modal').fadeOut();
                    template.addItem($(this).html());
                  },
                },
                {
                  tag: 'button',
                  class: 'buttonQuestionOption',
                  label: 'Single Select',
                  up_action: function () {
                    $(template.new_question_form).fadeOut();
                    $('#questionnaire-modal').fadeOut();
                    template.addItem($(this).html());
                  },
                },
                {
                  tag: 'button',
                  class: 'buttonQuestionOption',
                  label: 'Multi Select',
                  up_action: function () {
                    $(template.new_question_form).fadeOut();
                    $('#questionnaire-modal').fadeOut();
                    template.addItem($(this).html());
                  },
                },
                {
                  tag: 'button',
                  class: 'buttonQuestionOption',
                  label: 'Text Field(s)',
                  up_action: function () {
                    $(template.new_question_form).fadeOut();
                    $('#questionnaire-modal').fadeOut();
                    template.addItem($(this).html());
                  },
                },
              ],
            },
            {
              tag: 'div',
              class: 'wrapper centerText',
              children: [
                {
                  tag: 'button',
                  class: 'buttonQuestionOption',
                  label: 'Date / Time',
                  up_action: function () {
                    $(template.new_question_form).fadeOut();
                    $('#questionnaire-modal').fadeOut();
                    template.addItem($(this).html());
                  },
                },
                {
                  tag: 'button',
                  class: 'buttonQuestionOption',
                  label: 'Number',
                  up_action: function () {
                    $(template.new_question_form).fadeOut();
                    $('#questionnaire-modal').fadeOut();
                    template.addItem($(this).html());
                  },
                },
                {
                  tag: 'button',
                  class: 'buttonQuestionOption',
                  label: 'Range',
                  up_action: function () {
                    $(template.new_question_form).fadeOut();
                    $('#questionnaire-modal').fadeOut();
                    template.addItem($(this).html());
                  },
                },
                {
                  tag: 'button',
                  class: 'buttonQuestionOption',
                  label: 'Matrix',
                  up_action: function () {
                    $(template.new_question_form).fadeOut();
                    $('#questionnaire-modal').fadeOut();
                    template.addItem($(this).html());
                  },
                },
                {
                  tag: 'button',
                  class: 'buttonQuestionOption',
                  label: 'Location',
                  up_action: function () {
                    $(template.new_question_form).fadeOut();
                    $('#questionnaire-modal').fadeOut();
                    template.addItem($(this).html());
                  },
                },
              ],
            },

            { tag: 'p', class: 'headerLabel', html: 'New Page' },
            {
              tag: 'div',
              class: 'wrapper centerText',
              children: [
                {
                  tag: 'button',
                  class: 'buttonQuestionOption',
                  label: 'Text',
                  up_action: function () {
                    $(template.new_question_form).fadeOut();
                    $('#questionnaire-modal').fadeOut();
                    template.addItem($(this).html());
                  },
                },
                {
                  tag: 'button',
                  class: 'buttonQuestionOption disabled',
                  label: 'Consent',
                  up_action: function () {
                    $(template.new_question_form).fadeOut();
                    $('#questionnaire-modal').fadeOut();
                    template.addItem($(this).html());
                  },
                },
              ],
            },
          ],
        },
        {
          tag: 'div',
          class: 'questionReorderControlBar',
          children: [
            {
              tag: 'button',
              label: 'Cancel',
              class: 'buttonCancelForm',
              up_action: function () {
                $(template.new_question_form).fadeOut();
                $('#questionnaire-modal').fadeOut();
              },
            },
          ],
        },
      ],
    });

    Questionnaires.templates.push(template);

    $('#questionnaire-info-message').hide();

    if (is_new) {
      //if questionnaire was created by user, open template in edit mode

      template.edit_mode = true;
      template.view(false);
      setTimeout(function () {
        template.save(true);
      }, 500);
    }

    // if (is_copy) {
    //     console.log(template)
    //     template.save();
    //     // template.save(true);
    // }
  }

  getInfo() {
    let template = this;

    $('.questionScrollIcon, .headerScrollIcon, .sectionScrollIcon, .iconActive').removeClass('iconActive');
    $('.sectionScrollIconActive').removeClass('sectionScrollIconActive');
    $('#button-previous-question').addClass('disabled');
    $('#button-next-question, #button-add-question').removeClass('disabled');
    $('#intro-scroll-icon').addClass('iconActive');

    if (!this.info_page) {
      this.info_page = DOM.new({
        tag: 'div',
        class: 'wrapper',
        children: [
          {
            tag: 'div',
            class: 'wrapperNoPad alignLeft',
            children: [
              { tag: 'p', class: 'questionnaireInfoHeader', html: 'Name' },
              { tag: 'p', id: 'questionnaire-' + template.id + '-name-field', class: 'questionnaireInfo', html: this.name },
            ],
          },
          {
            tag: 'div',
            class: 'wrapperNoPad alignLeft',
            children: [
              { tag: 'p', class: 'questionnaireInfoHeader', html: 'Description' },
              {
                tag: 'p',
                id: 'questionnaire-' + template.id + '-description-field',
                class: 'questionnaireInfo',
                html: this.description,
              },
            ],
          },
          {
            tag: 'div',
            class: 'wrapperNoPad alignLeft',
            children: [
              { tag: 'p', class: 'questionnaireInfoHeader', html: 'Display Mode' },
              { tag: 'p', class: 'questionnaireDetailText indentSmall displayMode', html: template.display_mode },
            ],
          },
          {
            tag: 'div',
            class: 'wrapperNoPad alignLeft allowBackWrapper',
            children: [
              { tag: 'p', class: 'questionnaireInfoHeader', html: 'Allow Back' },
              { tag: 'p', class: 'questionnaireDetailText indentSmall allowBack', html: template.allow_back },
            ],
          },
          {
            tag: 'div',
            class: 'wrapperNoPad alignLeft editableWrapper',
            children: [
              { tag: 'p', class: 'questionnaireInfoHeader', html: 'Editable' },
              { tag: 'p', class: 'questionnaireDetailText indentSmall editable', html: template.editable },
            ],
          },
          {
            tag: 'div',
            class: 'wrapperNoPad alignLeft defaultRequiredWrapper',
            children: [
              { tag: 'p', class: 'questionnaireInfoHeader', html: 'Required' },
              { tag: 'p', class: 'questionnaireDetailText indentSmall requiredDefault', html: template.required_default },
            ],
          },
          {
            tag: 'div',
            class: 'wrapperNoPad alignLeft assetEmbeddingWrapper',
            children: [
              { tag: 'p', class: 'questionnaireInfoHeader', html: 'Asset Embedding' },
              { tag: 'p', class: 'questionnaireDetailText indentSmall assetEmbedding', html: template.asset_embedding },
            ],
          },
        ],
      });

      this.edit_info_page = DOM.new({
        tag: 'div',
        class: 'wrapper',
        children: [
          {
            tag: 'div',
            class: 'wrapperNoPad alignLeft',
            children: [
              { tag: 'p', class: 'questionnaireInfoHeader', html: 'Name' },
              {
                tag: 'input',
                class: 'shortAnswer',
                value: this.name,
                keyup: function () {
                  if (this.update_timer !== null) clearTimeout(this.update_timer);
                  let value = $(this).val();
                  $(template.info_page)
                    .find('#questionnaire-' + template.id + '-name-field')
                    .html(value);
                  this.update_timer = setTimeout(function () {
                    template.name = value;
                    $(template.info_page)
                      .find('#questionnaire-' + template.id + '-name-field')
                      .html(value);
                    $(template.list_item)
                      .find('#questionnaire-template-' + template.id + '-label')
                      .html(value);
                    $('#questionnaire-label').html(value);
                    template.save();
                  }, 450);
                },
              },
            ],
          },
          {
            tag: 'div',
            class: 'wrapperNoPad alignLeft',
            children: [
              { tag: 'p', class: 'questionnaireInfoHeader', html: 'Description' },
              {
                tag: 'input',
                class: 'shortAnswer',
                value: this.description,
                keyup: function () {
                  if (this.update_timer !== null) clearTimeout(this.update_timer);
                  let value = $(this).val();
                  $(template.info_page)
                    .find('#questionnaire-' + template.id + '-description-field')
                    .html(value);
                  this.update_timer = setTimeout(function () {
                    template.description = value;
                    $(template.info_page)
                      .find('#questionnaire-' + template.id + '-description-field')
                      .html(value);
                    $(template.list_item)
                      .find('#questionnaire-template-' + template.id + '-description')
                      .html(value);
                    if (value)
                      $(template.list_item)
                        .find('#questionnaire-template-' + template.id + '-description')
                        .removeClass('hidden')
                        .show();

                    template.save();
                  }, 450);
                },
              },
            ],
          },

          //multi page
          {
            tag: 'div',
            class: 'wrapperNoPad alignLeft',
            children: [
              { tag: 'p', class: 'questionnaireInfoHeader', html: 'Display Mode' },
              {
                tag: 'div',
                class: 'inlineContainer clickable',
                children: [
                  { tag: 'button', class: 'radioButtonQuestionnaire multiPage' },
                  { tag: 'p', class: 'questionnaireDetailText', html: 'Multiple Pages' },
                ],
                click: function () {
                  $(this).parent().find('.radioButtonActive').removeClass('radioButtonActive');
                  $(this).find('.radioButtonQuestionnaire').addClass('radioButtonActive');
                  $(this).addClass('unclickable').removeClass('clickable');
                  $(this).next().removeClass('unclickable').addClass('clickable');
                  template.display_mode = 'multi';
                  $(template.info_page).find('.displayMode').html('Multiple Pages');
                  $(template.info_page).find('.allowBackWrapper').removeClass('disabled');
                  $(template.info_page).find('.editableWrapper').addClass('disabled');
                  template.editable = false;
                  $(template.info_page).find('.editable').html('False');
                  $(template.edit_info_page).find('.editableTrue').removeClass('radioButtonActive');
                  $(template.edit_info_page).find('.editableFalse').addClass('radioButtonActive');
                  $(template.edit_info_page).find('.editableWrapper').addClass('disabled');
                  $(template.edit_info_page).find('.allowBackWrapper').removeClass('disabled');

                  template.save();
                },
              },

              //single page
              {
                tag: 'div',
                class: 'inlineContainer clickable',
                children: [
                  { tag: 'button', class: 'radioButtonQuestionnaire singlePage' },
                  { tag: 'p', class: 'questionnaireDetailText', html: 'Single Page' },
                ],
                click: function () {
                  $(this).parent().find('.radioButtonActive').removeClass('radioButtonActive');
                  $(this).find('.radioButtonQuestionnaire').addClass('radioButtonActive');
                  $(this).addClass('unclickable').removeClass('clickable');
                  $(template.info_page).find('.allowBackWrapper').addClass('disabled');
                  $(template.edit_info_page).find('.allowBackWrapper').addClass('disabled');
                  $(template.info_page).find('.editableWrapper').removeClass('disabled');
                  $(template.edit_info_page).find('.editableWrapper').removeClass('disabled');
                  $(this).prev().removeClass('unclickable').addClass('clickable');
                  template.display_mode = 'single';
                  $(template.info_page).find('.displayMode').html('Single Page');
                  template.save();
                },
              },
            ],
          },

          //allow back
          {
            tag: 'div',
            class: 'wrapperNoPad alignLeft allowBackWrapper',
            children: [
              { tag: 'p', class: 'questionnaireInfoHeader', html: 'Allow Back' },
              {
                tag: 'div',
                class: 'inlineContainer clickable',
                children: [
                  { tag: 'button', class: 'radioButtonQuestionnaire allowBackTrue' },
                  { tag: 'p', class: 'questionnaireDetailText', html: 'Yes' },
                ],
                click: function () {
                  $(this).parent().find('.radioButtonActive').removeClass('radioButtonActive');
                  $(this).find('.radioButtonQuestionnaire').addClass('radioButtonActive');
                  $(this).addClass('unclickable').removeClass('clickable');
                  $(this).parent().next().removeClass('disabled');
                  $(this).next().removeClass('unclickable').addClass('clickable');
                  template.allow_back = true;
                  $(template.info_page).find('.allowBack').html('Yes');
                  template.save();
                },
              },

              {
                tag: 'div',
                class: 'inlineContainer clickable',
                children: [
                  { tag: 'button', class: 'radioButtonQuestionnaire allowBackFalse' },
                  { tag: 'p', class: 'questionnaireDetailText', html: 'No' },
                ],
                click: function () {
                  $(this).parent().find('.radioButtonActive').removeClass('radioButtonActive');
                  $(this).find('.radioButtonQuestionnaire').addClass('radioButtonActive');
                  $(this).addClass('unclickable').removeClass('clickable');
                  $(this).parent().next().removeClass('disabled');
                  $(this).prev().removeClass('unclickable').addClass('clickable');
                  template.allow_back = false;
                  $(template.info_page).find('.allowBack').html('No');
                  template.save();
                },
              },
            ],
          },

          //editable
          {
            tag: 'div',
            class: 'wrapperNoPad alignLeft editableWrapper',
            children: [
              { tag: 'p', class: 'questionnaireInfoHeader', html: 'Editable' },
              {
                tag: 'div',
                class: 'inlineContainer clickable',
                children: [
                  { tag: 'button', class: 'radioButtonQuestionnaire editableTrue' },
                  { tag: 'p', class: 'questionnaireDetailText', html: 'True' },
                ],
                click: function () {
                  $(this).parent().find('.radioButtonActive').removeClass('radioButtonActive');
                  $(this).find('.radioButtonQuestionnaire').addClass('radioButtonActive');
                  $(this).addClass('unclickable').removeClass('clickable');
                  $(this).next().removeClass('unclickable').addClass('clickable');
                  template.editable = true;
                  $(template.info_page).find('.editable').html('True');
                  $(template.info_page).find('.editableWrapper').removeClass('disabled');
                  $(template.info_page).find('.editableWrapper').addClass('disabled');
                  $(template.edit_info_page).find('.editableWrapper').removeClass('disabled');
                  template.save();
                },
              },

              {
                tag: 'div',
                class: 'inlineContainer clickable',
                children: [
                  { tag: 'button', class: 'radioButtonQuestionnaire editableFalse' },
                  { tag: 'p', class: 'questionnaireDetailText', html: 'False' },
                ],
                click: function () {
                  $(this).parent().find('.radioButtonActive').removeClass('radioButtonActive');
                  $(this).find('.radioButtonQuestionnaire').addClass('radioButtonActive');
                  $(this).addClass('unclickable').removeClass('clickable');
                  $(this).prev().removeClass('unclickable').addClass('clickable');
                  template.editable = false;
                  $(template.info_page).find('.editable').html('True');
                  template.save();
                },
              },
            ],
          },

          //required default
          {
            tag: 'div',
            class: 'wrapperNoPad alignLeft defaultRequiredWrapper',
            children: [
              { tag: 'p', class: 'questionnaireInfoHeader', html: 'Required' },
              {
                tag: 'div',
                class: 'inlineContainer clickable',
                children: [
                  { tag: 'button', class: 'radioButtonQuestionnaire defaultRequiredWrapperTrue' },
                  { tag: 'p', class: 'questionnaireDetailText', html: 'True' },
                ],
                click: function () {
                  $(this).parent().find('.radioButtonActive').removeClass('radioButtonActive');
                  $(this).find('.radioButtonQuestionnaire').addClass('radioButtonActive');
                  $(this).addClass('unclickable').removeClass('clickable');
                  $(this).parent().next().removeClass('disabled');
                  $(this).next().removeClass('unclickable').addClass('clickable');
                  template.required_default = true;
                  $(template.info_page).find('.requiredDefault').html('True');
                  template.save();
                },
              },

              {
                tag: 'div',
                class: 'inlineContainer clickable',
                children: [
                  { tag: 'button', class: 'radioButtonQuestionnaire defaultRequiredWrapperFalse' },
                  { tag: 'p', class: 'questionnaireDetailText', html: 'False' },
                ],
                click: function () {
                  $(this).parent().find('.radioButtonActive').removeClass('radioButtonActive');
                  $(this).find('.radioButtonQuestionnaire').addClass('radioButtonActive');
                  $(this).addClass('unclickable').removeClass('clickable');
                  $(this).parent().next().removeClass('disabled');
                  $(this).prev().removeClass('unclickable').addClass('clickable');
                  template.required_default = false;
                  $(template.info_page).find('.requiredDefault').html('False');
                  template.save();
                },
              },
            ],
          },

          // asset embedding
          {
            tag: 'div',
            class: 'wrapperNoPad alignLeft assetEmbeddingWrapper',
            children: [
              { tag: 'p', class: 'questionnaireInfoHeader', html: 'Asset Embedding' },
              {
                tag: 'div',
                class: 'inlineContainer clickable',
                children: [
                  { tag: 'button', class: 'radioButtonQuestionnaire assetEmbeddingTrue' },
                  { tag: 'p', class: 'questionnaireDetailText', html: 'Yes' },
                ],
                click: function () {
                  $(this).parent().find('.radioButtonActive').removeClass('radioButtonActive');
                  $(this).find('.radioButtonQuestionnaire').addClass('radioButtonActive');
                  $(this).addClass('unclickable').removeClass('clickable');
                  $(this).parent().next().removeClass('disabled');
                  $(this).next().removeClass('unclickable').addClass('clickable');
                  template.asset_embedding = true;
                  $(template.info_page).find('.assetEmbedding').html('Yes');
                  template.save();
                },
              },

              {
                tag: 'div',
                class: 'inlineContainer clickable',
                children: [
                  { tag: 'button', class: 'radioButtonQuestionnaire assetEmbeddingFalse' },
                  { tag: 'p', class: 'questionnaireDetailText', html: 'No' },
                ],
                click: function () {
                  $(this).parent().find('.radioButtonActive').removeClass('radioButtonActive');
                  $(this).find('.radioButtonQuestionnaire').addClass('radioButtonActive');
                  $(this).addClass('unclickable').removeClass('clickable');
                  $(this).parent().next().removeClass('disabled');
                  $(this).prev().removeClass('unclickable').addClass('clickable');
                  template.asset_embedding = false;
                  $(template.info_page).find('.assetEmbedding').html('No');
                  template.save();
                },
              },
            ],
          },
        ],
      });

      template.updateInfo();
    }

    //navigate to info page
    $('#questionnaire-view-template').children().not('.newQuestionModalForm').remove();
    if (this.edit_mode) {
      $(this.edit_info_page).appendTo($('#questionnaire-view-template'));
    } else {
      $(this.info_page).appendTo($('#questionnaire-view-template'));
    }
    this.current_question_index = -1;
    this.section_index = -1;
  }

  updateInfo() {
    let template = this;

    //set button settings for info page
    if (template.allow_back === false) {
      $(template.info_page).find('.allowBack').html('No');
      $(template.edit_info_page).find('.allowBackFalse').addClass('radioButtonActive');
    } else {
      $(template.info_page).find('.allowBack').html('Yes');
      $(template.edit_info_page).find('.allowBackTrue').addClass('radioButtonActive');
    }

    if (template.asset_embedding === false) {
      $(template.info_page).find('.assetEmbedding').html('No');
      $(template.edit_info_page).find('.assetEmbeddingFalse').addClass('radioButtonActive');
    } else {
      $(template.info_page).find('.assetEmbedding').html('Yes');
      $(template.edit_info_page).find('.assetEmbeddingTrue').addClass('radioButtonActive');
    }

    if (template.display_mode === 'single') {
      $(template.info_page).find('.displayMode').html('Single Page');
      $(template.edit_info_page).find('.singlePage').addClass('radioButtonActive');
      $(template.info_page).find('.allowBackWrapper').addClass('disabled');
      $(template.edit_info_page).find('.allowBackWrapper').addClass('disabled');
    } else {
      $(template.info_page).find('.editable').html('False');
      $(template.info_page).find('.editableWrapper').addClass('disabled');
      $(template.edit_info_page).find('.editableWrapper').addClass('disabled');
      $(template.info_page).find('.displayMode').html('Multiple Pages');
      $(template.edit_info_page).find('.multiPage').addClass('radioButtonActive');
    }

    if (template.required_default === false) {
      $(template.info_page).find('.requiredDefault').html('False');
      $(template.edit_info_page).find('.defaultRequiredWrapperFalse').addClass('radioButtonActive');
    } else {
      $(template.info_page).find('.requiredDefault').html('True');
      $(template.edit_info_page).find('.defaultRequiredWrapperTrue').addClass('radioButtonActive');
    }

    if (template.editable === false) {
      $(template.info_page).find('.editable').html('False');
      $(template.edit_info_page).find('.editableFalse').addClass('radioButtonActive');
    } else {
      $(template.info_page).find('.editable').html('True');
      $(template.edit_info_page).find('.editableTrue').addClass('radioButtonActive');
    }
  }

  getEnd() {
    let template = this;

    $('#button-next-question').addClass('disabled');
    $('#button-previous-question').removeClass('disabled');
    $('#button-add-question').addClass('disabled');
    $('.questionScrollIcon, .headerScrollIcon, .sectionScrollIcon, .iconActive').removeClass('iconActive');
    $('.sectionScrollIconActive').removeClass('sectionScrollIconActive');
    $('#end-scroll-icon').addClass('iconActive');

    if (!this.end_page) {
      this.end_page = DOM.new({
        tag: 'div',
        class: 'wrapper',
        children: [
          {
            tag: 'div',
            class: 'wrapper',
            style: 'text-align: left; padding: 0;',
            children: [
              { tag: 'p', class: 'questionnaireInfoHeader', html: 'Exit Poll' },
              {
                tag: 'p',
                id: 'questionnaire-' + template.id + '-description-field',
                class: 'questionnaireInfo',
                html: template.end_text,
              },
            ],
          },
        ],
      });

      this.edit_end_page = DOM.new({
        tag: 'div',
        class: 'wrapper',
        children: [
          {
            tag: 'div',
            class: 'wrapper',
            style: 'text-align: left; padding: 0;',
            children: [
              { tag: 'p', class: 'questionnaireInfoHeader', html: 'Exit Poll' },

              {
                tag: 'textarea',
                class: 'questionHeading',
                html: template.end_text,
                keyup: function () {
                  if (template.update_timer !== null) clearTimeout(template.update_timer);
                  let value = $(this).val();
                  template.update_timer = setTimeout(function () {
                    template.end_text = value;
                    $(template.end_page).find('.questionnaireInfo').html(value);
                    template.save(true);
                  }, 300);
                },
                blur: function () {
                  if (template.update_timer !== null) clearTimeout(template.update_timer);
                  let value = $(this).val();
                  template.end_text = value;
                  $(template.end_page).find('.questionnaireInfo').html(value);
                  template.save(true);
                },
              },
            ],
          },
        ],
      });
    }

    this.section_index = this.sections.length;
    this.current_question_index = -1;

    //navigate to info page
    $('#questionnaire-view-template').children().not('.newQuestionModalForm').remove();
    if (this.edit_mode) {
      $(this.edit_end_page).appendTo($('#questionnaire-view-template'));
    } else {
      $(this.end_page).appendTo($('#questionnaire-view-template'));
    }
  }

  getSections(animate) {
    let template = this;
    let callback = function (response_text) {
      let response = JSON.parse(response_text);

      //template properties
      //these are not database columns, they are only found in questionnaire template json payload

      // template.errors = response.questionnaire.errors;
      template.end_text = response.questionnaire.end_text;
      template.end_uuid = response.questionnaire.end_uuid;
      template.allow_back = response.questionnaire.allow_back;
      template.display_mode = response.questionnaire.display_mode;
      template.required_default = response.questionnaire.required_default;
      template.editable = response.questionnaire.editable ? response.questionnaire.editable : Questionnaires.EDITABLE_DEFAULT;
      template.asset_embedding =
        response.questionnaire.asset_embedding !== undefined
          ? response.questionnaire.asset_embedding
          : Questionnaires.ASSET_EMBEDDING_DEFAULT;
      template.is_copy = response.questionnaire.is_copy ? response.questionnaire.is_copy : false;

      for (let section of response.questionnaire.sections) new Section(template, section, false);

      template.addSectionGoTos();
      template.loaded = true;

      if (animate) {
        template.stopLoadingAnimation();

        //use loading animation if opening a template for the first time
      } else {
        //don't animate open if a template is new or was copied
        template.view();
      }

      template.updateItemCount(true);
    };
    Ajax.doGet(Questionnaires.url + this.id, callback);
  }

  getItems() {
    if (this.items.length === 0)
      for (let section of this.sections) {
        this.items.push(section);
        for (let question of section.questions) this.items.push(question);
      }
  }

  //edit actions
  addNewItem() {
    if (this.section_index === -1) {
      $(this.new_question_form).addClass('newSectionModalForm');
      $(this.new_question_form).children('.containerBottomBar').children().addClass('hidden');
      $(this.new_question_form).find('.wrapper').first().removeClass('hidden');
      $(this.new_question_form).find('.headerLabel').first().removeClass('hidden');
    } else {
      $(this.new_question_form).children('.containerBottomBar').children().removeClass('hidden');
      $(this.new_question_form).removeClass('newSectionModalForm');
    }

    $(this.new_question_form).fadeIn();
    $('#questionnaire-modal').fadeIn();
  }

  addItem(type) {
    $('#questionnaire-view-template').children().not('.newQuestionModalForm').remove();

    let template = this;
    let num = 1;
    let template_question_num = 1;

    // //if on info page
    // if (this.current_question_index === -1 && this.section_index === -1) {
    //
    //
    // }

    if (this.current_question_index !== -1) {
      num = this.current_question_index + 2;
      template_question_num = this.getCurrentQuestion().template_question_num + 1;
    } else if (template.sections.length > 1 && template.section_index !== 0 && template.section_index !== -1) {
      let previous_section = template.sections[template.section_index - 1];
      if (previous_section.questions.length)
        template_question_num = previous_section.questions[previous_section.questions.length - 1].template_question_num + 1;
    }

    let metadata;

    switch (type) {
      case 'Yes / No': {
        metadata = {
          type: 'Yes / No',
          required: template.required_default,
          heading: null,
          instructions: null,
          label: 'Enter your question text',
          value: 'enter_your_question_text',
          mode: 'list',
          decline: null,
          options: [
            {
              value: 'yes',
              label: 'Yes',
              go_to: null,
              sub_question: null,
            },
            {
              value: 'no',
              label: 'No',
              go_to: null,
              sub_question: null,
            },
          ],
        };
        new YesNo2(metadata, template, num, template_question_num, template.getCurrentSection(), true);
        break;
      }
      case 'Single Select': {
        metadata = {
          type: 'Single Select',
          required: template.required_default,
          label: 'Please select one of the following:',
          value: 'please_select_one_of_the_follo',
          heading: null,
          instructions: null,
          mode: 'list',
          options: [
            {
              value: 'response_1',
              label: 'Response 1',
              goto: null,
              sub_question: null,
            },
            {
              value: 'response_2',
              label: 'Response 2',
              goto: null,
              sub_question: null,
            },
            {
              value: 'response_3',
              label: 'Response 3',
              goto: null,
              sub_question: null,
            },
            {
              value: 'response_4',
              label: 'Response 4',
              goto: null,

              sub_question: null,
            },
          ],
          decline: null,
          defaults: 1,
          min: 1,
          max: 1,
        };
        new SingleAnswer2(metadata, template, num, template_question_num, template.getCurrentSection(), true);
        break;
      }
      case 'Multi Select': {
        metadata = {
          type: 'Multi Select',
          label: 'Please select one or more of the following:',
          value: 'please_select_one_or_more_of_t',
          heading: null,
          instructions: null,
          decline: null,
          options: [
            {
              value: 'response_1',
              label: 'Response 1',
              goto: null,

              sub_question: null,
            },
            {
              value: 'response_2',
              label: 'Response 2',
              goto: null,

              sub_question: null,
            },
            {
              value: 'response_3',
              label: 'Response 3',
              goto: null,

              sub_question: null,
            },
            {
              value: 'response_4',
              label: 'Response 4',
              goto: null,

              sub_question: null,
            },
          ],
          required: template.required_default,
        };
        new MultiAnswer2(metadata, template, num, template_question_num, template.getCurrentSection(), true);
        break;
      }

      case 'Location': {
        metadata = {
          type: 'Location',
          required: template.required_default,
          decline: null,
          heading: null,
          instructions: null,
          label: 'Please indicate your location',
          value: 'please_indicate_your_location',
        };
        new LocationField(metadata, template, num, template_question_num, template.getCurrentSection(), true);
        break;
      }

      case 'Text Field(s)': {
        metadata = {
          type: 'Multi Text',
          heading: null,
          questions: [
            {
              type: 'Text Field',
              required: template.required_default,
              heading: null,
              label: 'Response 1',
              value: 'response_1',
              instructions: null,
              decline: null,
            },
          ],
        };
        new MultiText(metadata, template, num, template_question_num, template.getCurrentSection(), true);
        break;
      }

      case 'Number': {
        metadata = {
          type: 'Number',
          required: template.required_default,
          heading: null,
          instructions: null,
          label: 'Please enter an integer',
          value: 'please_enter_an_integer',
          decline: null,
        };
        new NumberField(metadata, template, num, template_question_num, template.getCurrentSection(), true);
        break;
      }

      case 'Date / Time': {
        metadata = {
          type: 'DateTime',
          required: template.required_default,
          heading: null,
          instructions: null,
          label: 'Please enter a date',
          value: 'please_enter_an_date',
          decline: null,
        };
        new DateTime(metadata, template, num, template_question_num, template.getCurrentSection(), true);
        break;
      }

      case 'Range': {
        metadata = {
          type: 'Range',
          label: 'Please rate the following from 1 (the least likely) to 10 (the most likely):',
          value: 'please_rate_the_following_from',
          heading: null,
          instructions: null,
          range: {
            min: 1,
            max: 10,
          },
          decline: null,
          required: template.required_default,
        };
        new RangeAnswer2(metadata, template, num, template_question_num, template.getCurrentSection(), true);
        break;
      }

      case 'Matrix': {
        metadata = {
          type: 'Matrix',
          label: 'Please select one or more of the following:',
          heading: null,
          instructions: null,
          decline: null,
          rows: [
            {
              value: 'row_1',
              label: 'Row 1',
            },
            {
              value: 'row_1',
              label: 'Row 2',
            },
          ],
          columns: [
            {
              value: 'column_1',
              label: 'Column 1',
            },
            {
              value: 'column_2',
              label: 'Column 2',
            },
          ],
          required: template.required_default,
        };
        new Matrix(metadata, template, num, template_question_num, template.getCurrentSection(), true);
        break;
      }

      case 'Section': {
        //inspect section index, if -1, user is on info or end page
        //end page does not allow additions, so safe to assume we are on info page if section index is -1

        let section_index = this.section_index !== -1 ? ++this.section_index : this.sections.length;
        metadata = {
          label: null,
          num: section_index,
          questions: [],
          go_to: null,
        };
        $('#button-previous-question').removeClass('disabled');
        this.section_index = section_index;
        new Section(template, metadata, true);
        break;
      }

      case 'Text': {
        metadata = {
          type: 'Text',
          required: template.required_default,
          heading: 'Please enter a heading',
        };
        new TextPage(metadata, template, num, template_question_num, template.getCurrentSection(), true);
      }
    }
  }

  makeSortable() {
    let template = this;
    let container = $(template.reorder_question_form).find('.reorderQuestionContainer');
    template.max_scroll_top = Math.ceil(
      $(template.reorder_question_form).find('.reorderQuestionContainer').prop('scrollHeight') -
      $(template.reorder_question_form).find('.reorderQuestionContainer').prop('offsetHeight')
    );

    $.each($(template.reorder_question_form).find('.reorderSectionListItem'), function (index, value) {
      $(value).css('background-color', 'transparent');

      let height = $(value).children('.indent').height() + 56;
      $(value).height(height);

      if ($(value).find('.indent').children().length) {
        $(value).find('.indent').css('padding-bottom', '10px');
      } else {
        $(value).find('.indent').css('padding-bottom', '44px');
      }
    });

    //section drag to sort
    $(template.reorder_question_form)
      .find('.reorderQuestionContainer')
      .sortable({
        axis: 'y',
        forcePlaceholderSize: true,
        containment: 'parent',
        items: '> :not(.introSection, .endSection)',
        cancel: '.buttonExpandSection, .introSection, .endSection',
        placeholder: 'reorder-section-placeholder',

        helper: function (e, li) {
          this.copyHelper = li.clone().insertAfter(li);
          $(this).data('copied', false);
          let clone = li.clone();
          $(clone).find('.indent, .buttonExpandSection').remove();
          $(clone).find('.reorderSectionListItem').css('height', '55px').addClass('reorderItemClone');

          return clone;
        },
        start: function (e, ui) {
          $(template.reorder_question_form).find('.reorderQuestionContainer').sortable('refreshPositions');
          $(this).data('maxScrollTop', template.max_scroll_top);
        },
        sort: function (e, ui) {
          //check if scrolling is out of boundaries
          let scrollParent = $(this).data('ui-sortable').scrollParent;
          let maxScrollTop = $(this).data('maxScrollTop');

          if (scrollParent.scrollTop() > template.max_scroll_top) scrollParent.scrollTop(template.max_scroll_top);

          let intro = $(template.reorder_question_form).find('.introSection');
          let end = $(template.reorder_question_form).find('.endSection');
          if ($(ui.helper).position().top <= 70) {
            $(ui.placeholder).insertAfter($(intro));
            if ($(ui.placeholder).next().find('.originalQuestionPlaceholder').length) {
              $(ui.placeholder).css('opacity', '0');
            } else {
              $(ui.placeholder).css('opacity', '1');
            }
            return;
          }

          if ($(ui.helper).position().top >= $(end).position().top) {
            $(ui.placeholder).insertBefore($(end));
            if ($(ui.placeholder).prev().find('.originalQuestionPlaceholder').length) {
              $(ui.placeholder).css('opacity', '0');
            } else {
              $(ui.placeholder).css('opacity', '1');
            }
            return;
          }

          $.each($('.reorderSectionListItem'), function (index, value) {
            if (
              $(ui.helper).position().top > $(value).parent().position().top &&
              $(ui.helper).position().top < $(value).parent().position().top + $(value).parent().prop('offsetHeight')
            ) {
              //if can we show placeholder, placeholder doesn't show around highlighted original section
              if (
                !$(value).hasClass('originalQuestionPlaceholder') &&
                !$(value).parent().hasClass('introSection') &&
                !$(value).parent().hasClass('endSection')
              ) {
                //show placeholder based on section height midpoint
                let midpoint = $(value).parent().position().top + $(value).parent().prop('offsetHeight') / 2;

                if ($(ui.helper).position().top + 27.5 <= midpoint) {
                  $(ui.placeholder).insertBefore($(value).parent());
                  if ($(ui.placeholder).prev().find('.originalQuestionPlaceholder').length) {
                    $('.reorder-section-placeholder').css('opacity', '0');
                  } else {
                    $('.reorder-section-placeholder').css('opacity', '1');
                  }
                } else {
                  $(ui.placeholder).insertAfter($(value).parent());
                  if ($(ui.placeholder).next().find('.originalQuestionPlaceholder').length) {
                    $('.reorder-section-placeholder').css('opacity', '0');
                  } else {
                    $('.reorder-section-placeholder').css('opacity', '1');
                  }
                }
                false;
              } else {
                $(ui.placeholder).css('opacity', '0');
                $('.reorder-section-placeholder').css('opacity', '0');
                false;
              }
            }
          });
        },
        stop: function () {
          setTimeout(function () {
            template.max_scroll_top = Math.ceil(
              $(template.reorder_question_form).find('.reorderQuestionContainer').prop('scrollHeight') -
              $(template.reorder_question_form).find('.reorderQuestionContainer').prop('offsetHeight')
            );

            template.reorderItems();
          }, 100);

          let copied = $(this).data('copied');
          if (!copied) this.copyHelper.remove();
          this.copyHelper = null;

          $.each($('.reorderSectionListItem'), function (index, value) {
            $(value).css('background-color', 'transparent');
            $(value).removeClass('originalQuestionPlaceholder');
          });
        },
      });

    //question drag to sort
    $(template.reorder_question_form)
      .find('.reorderSectionListItem')
      .children('.wrapperNoPad')
      .sortable({
        axis: 'y',
        forcePlaceholderSize: true,
        placeholder: 'reorder-question-placeholder',
        connectWith: '.indent',
        cancel: '.introSection, .endSection',
        containment: container,
        tolerance: 'pointer',

        helper: function (e, li) {
          this.copyHelper = li.clone().insertAfter(li);
          $(this).data('copied', false);
          return $(li.clone()).addClass('reorderItemClone');
        },
        start: function (e, ui) {
          $(template.reorder_question_form).find('.indent').sortable('refreshPositions');
          //set max scrollTop for sortable scrolling
          // $(this).data('maxScrollTop', template.max_scroll_top);
        },

        sort: function (e, ui) {
          //check if scrolling is out of boundaries
          let scrollParent = $(this).data('ui-sortable').scrollParent;
          let maxScrollTop = $(this).data('maxScrollTop');

          //set a new max scroll top value after scrolling to the bottom of the page for the first time

          if (scrollParent.scrollTop() > template.max_scroll_top) scrollParent.scrollTop(template.max_scroll_top);

          //check if section has original
          if ($('.reorder-question-placeholder').parent().find('.originalQuestionPlaceholder').length) {
            if ($(ui.placeholder).index() === $('.reorder-question-placeholder').parent().children().length - 2) {
              $('.reorder-question-placeholder').css('opacity', '1');
              return;
            }

            if (
              $(ui.placeholder).prev().hasClass('originalQuestionPlaceholder') ||
              $(ui.placeholder).next().hasClass('originalQuestionPlaceholder')
            ) {
              $('.reorder-question-placeholder').css('opacity', '0');
            } else {
              $('.reorder-question-placeholder').css('opacity', '1');
            }
          } else {
            $('.reorder-question-placeholder').css('opacity', '1');
          }
        },
        over: function (e, ui) {
          $('.reorderSectionListItem').css('background-color', 'transparent');
          $(ui.placeholder).parent().parent().css('background-color', 'color: hsl(150, 100%, 65%)');
          if (!$(e.target).find('.originalQuestionPlaceholder').length) {
            $('.reorder-qnaire-placeholder').css('opacity', '1');
          }
        },
        out: function (e) {
          $(e.target).parent().parent().css('background-color', 'transparent');
        },
        receive: function (e, ui) {
          if ($(ui.item).parent().hasClass('sectionCollapsed')) {
            let parent = $(ui.item).parent();
            if ($(parent).children().length > 1) {
              $(ui.item).detach().insertAfter($(parent).children('.reorderQuestionListItem').last());
            }
          }
        },
        stop: function (e, ui) {
          setTimeout(function () {
            template.max_scroll_top = Math.ceil(
              $(template.reorder_question_form).find('.reorderQuestionContainer').prop('scrollHeight') -
              $(template.reorder_question_form).find('.reorderQuestionContainer').prop('offsetHeight')
            );

            template.reorderItems();
          }, 100);

          let copied = $(this).data('copied');
          if (!copied) this.copyHelper.remove();
          this.copyHelper = null;

          $.each($(template.reorder_question_form).find('.reorderSectionListItem'), function (index, value) {
            $(value).css('background-color', 'transparent');

            let height = $(value).children('.indent').height() + 56;
            $(value).height(height);

            if ($(value).find('.indent').children().length) {
              $(value).find('.indent').css('padding-bottom', '10px');
            } else {
              $(value).find('.indent').css('padding-bottom', '44px');
            }
          });

          $.each($(template.reorder_question_form).find('.reorderQuestionListItem'), function (index, value) {
            $(value).removeClass('originalQuestionPlaceholder');
            $(value).css('background-color', 'transparent');
            $(value).css('opacity', '1');
          });
        },
      });

    $(template.reorder_question_form).find('.reorderQuestionContainer').sortable('refreshPositions');
    $(template.reorder_question_form).find('.indent').sortable('refreshPositions');
  }

  reorderItems() {
    //updates reordered items in the reorder items panel
    //updates question number, as well as the new indices of reordered items

    let template = this;

    setTimeout(function () {
      //todo MIGHT NEED TO REBUILD WITH SECTIONS

      let new_sections = [];

      $.each($(template.reorder_question_form).find('.indent'), function (index, value) {
        let previous_section_index = $(value).parent().parent().attr('id').split('-')[3] - 1;

        let current_section = template.getItemById($(value).parent().parent().attr('id').replace('section-', ''));

        current_section.new_questions = [];
        current_section.new_questions_metadata = [];

        $.each($(value).children('.reorderQuestionListItem').not('.ui-sortable-placeholder'), function (index, list_item) {
          // // //get section, question indices
          // let previous_section_index = $(list_item).attr("id").split("-")[3] - 1;
          // let previous_question_index = $(list_item).attr("id").split("-")[5] - 1;

          // let question = template.sections[previous_section_index].questions[previous_question_index];

          let question = template.getItemById($(list_item).attr('id').replace('question-', ''));

          if (question) {
            question.section = current_section;
            current_section.new_questions.push(question);
            current_section.new_questions_metadata.push(question.metadata);
          }
        });

        new_sections.push(current_section);
      });

      // console.log(new_sections)

      template.sections = new_sections;

      for (let section of template.sections) {
        section.questions = section.new_questions;

        //todo check if this messes up stuff
        delete section.new_questions;
        section.questions_metadata = section.new_questions_metadata;
      }

      // console.log(template.sections)

      $(template.reorder_question_form)
        .find('.reorderQuestionListItem, .reorderSectionListItem, .wrapperNoPad')
        .addClass('unclickable')
        .removeClass('clickable');

      setTimeout(function () {
        template.updateItemCount();

        //if active question
        if ($('#question-scroll-bar').find('.iconActive').length) {
          $('#question-scroll-bar').find('.iconActive').click();

          // $("#question-scroll-bar").find(".sectionScrollIconActive").removeClass("sectionScrollIconActive");
          // $("#question-scroll-bar").find(".iconActive").parent().addClass("sectionScrollIconActive");
          // $("#question-scroll-bar").removeClass("sectionScrollIconActive");
          //
          //
          // //todo need to fix
          // template.current_question_index = $("#question-scroll-bar").find(".iconActive").index() - 1;
          // template.section_index = $("#question-scroll-bar").find(".iconActive").parent().index() - 1;
        }
      }, 350);

      setTimeout(function () {
        $(template.reorder_question_form)
          .find('.reorderQuestionListItem, .reorderSectionListItem, .wrapperNoPad')
          .removeClass('unclickable')
          .addClass('clickable');
      }, 650);
    }, 1);
  }

  updateItemCount(no_save) {
    let template = this;

    template.question_map = {};
    template.num_questions = 0;

    $('#select-goto-scroll-bar').children().not('.infoIcon, .endIcon').remove();
    $('#question-scroll-bar').children().not('#intro-scroll-icon, #end-scroll-icon').remove();

    //update questions with new ids and content based upon their position in the reorder list
    for (let i = 0; i < template.sections.length; i++) {
      let section = template.sections[i];
      section.num = i + 1;
      $(section.view_question_DOM)
        .find('.questionNumber')
        .html('S' + section.num);
      $(section.edit_question_DOM)
        .find('.questionNumber')
        .html('S' + section.num);
      $(section.scroll_icon).remove('.questionScrollIcon');
      $(section.reorder_list_item).children('.reorderQuestionListItem').remove();
      $(section.scroll_icon)
        .children('.sectionScrollIcon')
        .html('S' + section.num);
      $(section.reorder_list_item).find('.buttonExpandSection').show();
      if (!section.questions.length) $(section.reorder_list_item).find('.buttonExpandSection').hide();

      let new_section_id = 'qnaire-' + template.id + '-section-' + section.num;

      for (let j = 0; j < section.questions.length; j++) {
        template.num_questions++;

        let question = section.questions[j];

        question.template_question_num = template.num_questions;
        template.question_map[question.template_question_num] = question;
        question.question_num = j + 1;
        $(question.branching_icon)
          .find('p.branch-node-label')
          .html('Q' + question.template_question_num);

        let label = 'Q' + question.template_question_num + ': ' + question.label;
        let short_label = 'Q' + question.template_question_num;
        let new_id = 'qnaire-' + template.id + '-section-' + section.num + '-question-' + question.question_num;

        if (question.constructor.name === 'TextPage') {
          short_label = 'P' + question.template_question_num;
          label = 'P' + question.template_question_num;
        } else if (question.constructor.name === 'MultiText') {
          if (question.heading) {
            short_label = 'Q' + question.template_question_num;
            label = 'Q' + question.template_question_num + ': ' + question.heading;
          } else {
            if (question.questions) {
              if (question.questions.length) {
                short_label = 'Q' + question.template_question_num;
                label = 'Q' + question.template_question_num + ': ' + question.questions[0].label;
              }
            }
          }
        }

        $(question.scroll_icon).children('p.scrollIconText').html(short_label);

        $(question.scroll_icon).click(function () {
          question.getPage();
        });

        // $(question.reorder_list_item).attr("id", new_id);
        $(question.scroll_icon).appendTo($(section.scroll_icon));
        $(question.view_question_DOM).children('.questionNumber').html(short_label);
        $(question.edit_question_DOM).children('.questionNumber').html(short_label);
        $(question.reorder_list_item).children('.reorderQuestionText').html(label);
        $(question.reorder_list_item)
          .detach()
          .appendTo($(section.reorder_list_item).children('.reorderSectionListItem').children('.wrapperNoPad'));
      }

      $(section.scroll_icon).insertBefore($('#question-scroll-bar').find('#end-scroll-icon'));
      $(section.scroll_icon).clone().insertBefore($('#select-goto-scroll-bar').find('.endIcon'));

      // $(section.reorder_list_item).attr("id", new_section_id);
      $(section.reorder_list_item).insertBefore($(template.reorder_question_form).find('.endSection'));
      $(section.reorder_list_item)
        .find('p.reorderSectionText')
        .html('S' + section.num);
      $('#question-scroll-bar').removeClass('sectionScrollIconActive');
    }

    //update invalid go tos
    for (let section of template.sections) {
      for (let question of section.questions) {
        if (question.options) question.inspectErrors();
      }
    }

    template.updateSectionGoTos();

    // //if active question
    // if ($("#question-scroll-bar").find(".iconActive").length) {
    //
    //     $("#question-scroll-bar").find(".iconActive").click();
    //
    //     // $("#question-scroll-bar").find(".sectionScrollIconActive").removeClass("sectionScrollIconActive");
    //     // $("#question-scroll-bar").find(".iconActive").parent().addClass("sectionScrollIconActive");
    //     // $("#question-scroll-bar").removeClass("sectionScrollIconActive");
    //     //
    //     //
    //     // //todo need to fix
    //     // template.current_question_index = $("#question-scroll-bar").find(".iconActive").index() - 1;
    //     // template.section_index = $("#question-scroll-bar").find(".iconActive").parent().index() - 1;
    // }

    template.makeSortable();
    if (!no_save) {
      // console.log("updating item count and saving")
      template.save();
    }

    // console.log("updating item count")
    // console.log(template.sections)
  }

  //UI method
  view(animate) {
    let template = this;
    $('#button-public-questionnaires').hide();

    if (template.loaded) {
      this.getInfo();

      // $("#questionnaire-save-indicator").removeClass("hidden")

      $('#questionnaire-viewer, #questionnaire-view-template').show();
      $('#questionnaire-edit-form').css('transform', 'translate(-100%)').hide();
      // $("#button-public-questionnaires").hide();
      $('#button-edit-questionnaire, #button-delete-questionnaire, #button-share-questionnaire').removeClass('hidden');

      $('#button-edit-questionnaire, #button-delete-questionnaire, #button-share-questionnaire').show();
      $('#questionnaire-viewer').css('transform', 'translate(-100%)');
      $('#questionnaire-viewer').children('.modalForm').addClass('disabled');

      $('#questionnaire-view-template').empty();
      $('#questionnaire-label').html(template.name);
      $('.headerBackArrowIcon').fadeIn(300);
      $(
        '.headerBackArrowIcon, #confirm-delete-questionnaire-button, #confirm-delete-question-button, #button-show-branching'
      ).unbind();
      $('.currentItems').unbind();

      if (template.edit_mode) {
        //toggle between edit mode
        $('#button-edit-questionnaire').addClass('buttonEditItemsSelected');
        $('#button-edit-questionnaire').children('svg').addClass('sectionEditButtonSvgSelected');
        $('#button-edit-questionnaire').removeClass('disabled');
        $('#button-reorder-questions, #button-add-question, .button-show-branching').removeClass('hidden');
      } else {
        $('#button-reorder-questions, #button-add-question').addClass('hidden');
        $('#button-edit-questionnaire').removeClass('buttonEditItemsSelected');
        $('#button-edit-questionnaire').children('svg').removeClass('sectionEditButtonSvgSelected');
      }

      //delete actions
      $('#confirm-delete-questionnaire-button')
        .unbind()
        .click(function () {
          template.deleteTemplate();
        });

      $('#button-share-questionnaire')
        .unbind()
        .click(function () {
          template.changeAccess();
        });

      $('.buttonDeleteSection')
        .unbind()
        .click(function () {
          if ($('#delete-section-form').find('.radioButton').last().hasClass('radioButtonActive')) {
            if (template.section_to_move_to) template.moveSectionQuestion(template.section_to_move_to);
          }
          template.deleteSection();
        });

      $('#confirm-delete-question-button').unbind();
      $('#confirm-delete-question-button').click(function () {
        template.deleteQuestion();
      });

      //bind the prev, next question buttons
      $(
        '#button-reorder-questions, #button-previous-question, #button-next-question, #button-add-question, ' +
        '#button-edit-questionnaire, .currentItems, .headerBackArrowIcon, #intro-scroll-icon'
      ).unbind();

      //edit button
      $('#button-edit-questionnaire').click(function () {
        template.toggleView();
      });

      $('#button-previous-question').click(function () {
        //on end page
        if (template.section_index === template.sections.length) {
          template.section_index--;
          template.current_question_index = template.sections[template.section_index].questions.length - 1;
          template.changeQuestion();
          return;
        }

        if (template.current_question_index === -1) {
          if (template.section_index === 0) {
            template.getInfo();
            return;
          }
          template.section_index--;
          template.current_question_index = template.sections[template.section_index].questions.length - 1;
        } else {
          template.current_question_index--;
        }
        template.changeQuestion();
      });

      template.setAccessIcon();

      $('#button-next-question').click(function () {
        //on info page
        if (template.section_index === -1) {
          template.section_index++;
          template.current_question_index = -1;
          template.changeQuestion();
          return;
        }

        if (template.current_question_index === template.getCurrentSection().questions.length - 1) {
          if (template.section_index === template.sections.length) {
            template.getEnd();
            return;
          }
          template.section_index++;
          template.current_question_index = -1;
        } else {
          template.current_question_index++;
        }
        template.changeQuestion();
      });

      //bind new question button
      $('#button-add-question').click(function () {
        template.addNewItem();
      });

      //intro
      $('#intro-scroll-icon').click(function () {
        // template.current_question_index = -1;
        // template.changeQuestion();
        template.getInfo();
        $('.sectionScrollIconActive').removeClass('sectionScrollIconActive');
      });

      //outro
      $('#end-scroll-icon').click(function () {
        // template.current_question_index = template.questions.length;
        // template.changeQuestion();
        template.getEnd();
        $('.sectionScrollIconActive').removeClass('sectionScrollIconActive');
      });

      //bind reorder question button
      $('#button-reorder-questions').click(function () {
        $(template.reorder_question_form).removeClass('disabled');
        $(template.reorder_question_form).fadeIn();

        // $.each($(template.reorder_question_form).find(".reorderSectionListItem"), function (index, value) {
        //     $(value).height($(value).prop("scrollHeight"));
        // });

        $.each($('.reorderSectionListItem'), function (index, value) {
          if ($(value).find('.indent').children().length) {
            let height = $(value).children('.wrapperNoPad').height() + 56;
            $(value).height(height);
            $(value).find('.indent').css('padding-bottom', '10px');
          } else {
            $(value).find('.indent').css('padding-bottom', '44px');
          }
        });

        template.updateItemCount();
        template.makeSortable();

        $('#questionnaire-modal').fadeIn();
      });

      //bind reorder question button
      $('#button-show-branching').click(function () {
        $(template.branching_form).removeClass('disabled');
        $(template.branching_form).fadeIn();
        $('#questionnaire-modal').fadeIn();
        $('.question-flow-info-panel').hide();
        template.updateItemCount();
        template.drawBranches();
      });

      $('.currentItems').addClass('clickable');

      $('.currentItems, .headerBackArrowIcon').click(function () {
        template.exit();
      });

      if (template.current_question_index === -1) {
        template.changeQuestion();
      } else {
        if (template.questions[template.current_question_index]) {
          if ($(template.questions[template.current_question_index].view_question_DOM))
            $(template.questions[template.current_question_index].view_question_DOM).appendTo(
              $('#questionnaire-view-template')
            );
        }
      }

      //scroll bar icons
      $('#question-scroll-bar').children().not('#intro-scroll-icon, #end-scroll-icon').remove();
      $('#question-scroll-bar').find('.sectionScrollContainer').remove();
      $('#select-goto-scroll-bar').children().not('.endIcon, .infoIcon').remove();

      $('.iconActive').not('#intro-scroll-icon').removeClass('iconActive');

      this.resizeItems(true);

      setTimeout(function () {
        for (let item of template.sections) {
          if (item.scroll_icon) {
            let icon1 = $(item.scroll_icon).clone();
            $(item.scroll_icon).insertBefore($('#question-scroll-bar').find('#end-scroll-icon'));
            $(icon1).insertBefore($('#select-goto-scroll-bar').children().last());
          }
        }
      }, 5);

      setTimeout(function () {
        $('#intro-scroll-icon').click();
      }, 200);

      $(template.branching_form).hide();
      $('#questionnaire-modal').hide();
    } else {
      // only animate if template not loaded
      if (!template.id) return;
      template.getSections(!template.loaded);
      if (animate) template.startLoadingAnimation();
    }

    $('#questionnaire-section-dock').addClass('questionnaire-viewer-open');
  }

  exit() {
    let template = this;

    $('#questionnaire-modal').hide();
    $(template.branching_form).hide();
    $('.currentItems').removeClass('clickable');
    $('#button-edit-questionnaire, #button-delete-questionnaire, #button-share-questionnaire').addClass('hidden');
    $('#button-edit-questionnaire, #button-delete-questionnaire, #button-share-questionnaire').hide();
    $('#questionnaire-label').html('');
    template.resizeItems(false);
    $(template.reorder_question_form).hide();
    Content.exitViewer();
    // Utils.fadeOutCrossBrowser( $("#questionnaire-save-indicator"), 350);
    // $("#questionnaire-save-indicator").fadeOut(200)
    // $("#questionnaire-save-indicator").html("")
    // $("#questionnaire-section-dock").removeClass("questionnaire-viewer-open");
  }

  startLoadingAnimation() {
    let template = this;

    template.loading_anim_delay = setTimeout(function () {
      $('#questionnaires-loading-message').removeClass('hidden');
      $('#questionnaires-loading-message').show();

      let top = $(template.list_item)[0].getBoundingClientRect().top + ($(template.list_item)[0].offsetHeight / 2 - 50);
      $(template.list_item).css('opacity', 0.5);

      $('#questionnaires-loading-message').css('top', top);

      // $("#questionnaire-save-indicator").removeClass("hidden")
    }, 400);

    $('#questionnaires-container .questionnaire-list-item, .questionnaire-list-item div').addClass('unclickable');
  }

  stopLoadingAnimation() {
    let template = this;

    if (!$('#questionnaires-loading-message').hasClass('hidden')) {
      setTimeout(function () {
        $('#questionnaires-loading-message')
          .children('.uploadSpinner')
          .children('.uploadSecondarySpinner')
          .removeClass('transparent');
        $('#questionnaires-loading-message')
          .children('.uploadSpinner')
          .children('.uploadSecondarySpinner')
          .css('border', '4px solid hsl(140, 75%, 55%)');
        $('#questionnaires-loading-message')
          .children('.uploadSpinner')
          .children('.uploadSecondarySpinner')
          .css('background-color', 'hsl(140, 75%, 55%)');
      }, 500);

      setTimeout(function () {
        $('#questionnaires-loading-message')
          .children('.uploadSpinner')
          .children('.uploadSecondarySpinner')
          .removeClass('uploadSpinnerRotate');
      }, 1000);

      setTimeout(function () {
        $('#questionnaires-loading-message').fadeOut(300);
        setTimeout(function () {
          $('#questionnaires-loading-message').addClass('hidden');
        }, 300);
      }, 1200);

      setTimeout(function () {
        $(template.list_item).css('opacity', 1);

        template.view();

        // template.updateItemCount();

        setTimeout(function () {
          $('#questionnaires-container .questionnaire-list-item, .questionnaire-list-item div').removeClass('unclickable');
        }, 350);

        $('#questionnaires-loading-message')
          .children('.uploadSpinner')
          .children('.uploadSecondarySpinner')
          .css('background-color', 'hsl(0, 0%, 10%)')
          .addClass('transparent')
          .css('border-right-color', '4px solid hsla(0, 0%, 0%, 0)')
          .css('border-left-color', '4px solid hsla(0, 0%, 0%, 0)')
          .addClass('uploadSpinnerRotate');
      }, 2000);
    } else {
      // //if animation not yet triggered, show questionnaire right away
      clearTimeout(template.loading_anim_delay);
      $('#questionnaires-container .questionnaire-list-item, .questionnaire-list-item div').removeClass('unclickable');

      //small delay to ensure smooth animation
      setTimeout(function () {
        template.view();
      }, 100);
    }
  }

  // copy2() {
  //
  //     let template = this;
  //     let questionnaire_copy = {};
  //     let sections = [];
  //
  //     let generateCopyName = function () {
  //         let copy_num = 0;
  //         // inspect owned templates to generate copy name
  //         for (let qnaire_template of Questionnaires2.templates.filter(template => template.owner === Content.user)) {
  //             if (qnaire_template.version === template.uuid
  //                 || qnaire_template.uuid === template.uuid
  //                 || qnaire_template.version === template.version) copy_num++;
  //         }
  //         if (!copy_num) copy_num++;
  //         return template.name + " (Copy " + copy_num + ")";
  //     }
  //
  //     // questionnaire.id = template.id;
  //     questionnaire_copy.uuid = Utils.generateUUID();
  //     questionnaire_copy.version = template.uuid;
  //     questionnaire_copy.subversion = template.subversion;
  //     questionnaire_copy.owner = template.owner;
  //     questionnaire_copy.name = generateCopyName();
  //     questionnaire_copy.access = "private";
  //     questionnaire_copy.description = template.description;
  //     questionnaire_copy.errors = template.errors;
  //     questionnaire_copy.required_default = template.required_default;
  //     questionnaire_copy.allow_back = template.allow_back;
  //
  //     if (template.loaded) {
  //
  //         let callback = function (response_text) {
  //             let response = JSON.parse(response_text);
  //             if (response.success === true) {
  //
  //                 let copied_questionnaire_template = new QuestionnaireTemplate2(response.questionnaire, false, true);
  //                 copied_questionnaire_template.sections = template.sections;
  //
  //                 copied_questionnaire_template.loaded = true;
  //
  //                 copied_questionnaire_template.question_map = template.question_map;
  //                 copied_questionnaire_template.question_id_map = template.question_id_map;
  //                 copied_questionnaire_template.section_id_map = template.section_id_map;
  //
  //                 // // update parent template
  //                 for (let section of copied_questionnaire_template.sections) {
  //                     section.parent_template = copied_questionnaire_template;
  //                     for (let question of section.questions) {
  //                         question.section = section;
  //                         question.parent_template = copied_questionnaire_template;
  //                     }
  //                 }
  //
  //                 copied_questionnaire_template.save(true);
  //
  //             }
  //         };
  //
  //         Ajax.doPut(Questionnaires2.url, callback, JSON.stringify(questionnaire_copy));
  //
  //     } else {
  //
  //         let sections_callback = function (response_text) {
  //
  //             let response = JSON.parse(response_text);
  //
  //             //template properties
  //             //these are not database columns, but are found in questionnaire template payload
  //
  //             // template.errors = response.questionnaire.errors;
  //             template.end_text = response.questionnaire.end_text;
  //             template.end_uuid = response.questionnaire.end_uuid;
  //             template.allow_back = response.questionnaire.allow_back;
  //             template.display_mode = response.questionnaire.display_mode;
  //             template.required_default = response.questionnaire.required_default;
  //
  //             for (let section of response.questionnaire.sections) new Section2(template, section, false);
  //
  //             // template.addSectionGoTos();
  //
  //             // for (let section of template.sections) sections.push(section.toJSON());
  //             // questionnaire_copy.sections = sections;
  //
  //             // questionnaire_copy.sections = template.sections;
  //
  //             let callback = function (response_text) {
  //
  //                 let response = JSON.parse(response_text);
  //                 if (response.success === true) {
  //
  //                     let copied_questionnaire_template = new QuestionnaireTemplate2(response.questionnaire, false, true);
  //                     copied_questionnaire_template.sections = template.sections;
  //
  //                     copied_questionnaire_template.loaded = true;
  //                     copied_questionnaire_template.question_map = template.question_map;
  //                     copied_questionnaire_template.question_id_map = template.question_id_map;
  //                     copied_questionnaire_template.section_id_map = template.section_id_map;
  //
  //                     // update parent template
  //                     for (let section of copied_questionnaire_template.sections) {
  //                         section.parent_template = copied_questionnaire_template;
  //                         for (let question of section.questions) {
  //                             question.section = section;
  //                             question.parent_template = copied_questionnaire_template;
  //                         }
  //                     }
  //                     copied_questionnaire_template.save(true);
  //
  //                 }
  //             };
  //
  //             Ajax.doPut(Questionnaires2.url, callback, JSON.stringify(questionnaire_copy));
  //
  //             // $(template.list_item).find(".buttonQuestionnaireView, .buttonQuestionnaireEdit, .buttonQuestionnaireCopy").removeClass("disabled");
  //         };
  //
  //         Ajax.doGet(Questionnaires2.url + template.id, sections_callback)
  //     }
  //
  //
  // }

  showCopyForm() {
    let questionnaire = this;
    let hideCopyForm;
    let generateCopyName;

    // private copy does not add update button
    // private copy generates completely de-coupled questionnaire copy
    if (questionnaire.access === 'private') {
      Utils.fadeInPrimaryModal();

      hideCopyForm = function () {
        Utils.fadeOutPrimaryModal();
        $('#copy-questionnaire-form').fadeOut(300);
        setTimeout(function () {
          $('#copy-questionnaire-form').find('#new-questionnaire-name-field').val('');
        }, 300);
      };

      generateCopyName = function () {
        let copy_num = 0;
        // inspect owned templates to generate copy name
        for (let qnaire_template of Questionnaires.templates.filter((template) => template.owner === Content.user)) {
          if (
            qnaire_template.version === questionnaire.uuid ||
            qnaire_template.uuid === questionnaire.uuid ||
            qnaire_template.version === questionnaire.version
          )
            copy_num++;
        }
        if (!copy_num) copy_num++;
        let base_name = questionnaire.name;
        if (questionnaire.name.indexOf('(Copy ') !== -1) base_name = base_name.substring(0, questionnaire.name.indexOf('(Copy '));

        let copy_name = base_name.trim() + ' (Copy ' + copy_num + ')';
        let highest_num = copy_num;

        for (let qnaire_template of Questionnaires.templates.filter((template) => template.owner === Content.user)) {
          let name1;
          let name2;

          if (questionnaire.name.indexOf('(Copy ') !== -1) {
            name1 = base_name.substring(0, questionnaire.name.indexOf('(Copy '));

            if (qnaire_template.name.indexOf('(Copy ') !== -1) {
              name2 = qnaire_template.name.substring(0, qnaire_template.name.indexOf('(Copy '));

              // if two templates have the same base name
              if (name1 === name2) {
                let index1 = qnaire_template.name.indexOf('(Copy');
                let index2 = qnaire_template.name.length - 1;

                let copy_num = qnaire_template.name.substring(index1 + 5, index2);

                if (highest_num < copy_num) highest_num = copy_num;
              }
            }
          }

          // if (qnaire_template.name === base_name.trim() + " (Copy " + copy_num + ")")
          //     copy_name = base_name.trim() + " (Copy " + ++copy_num + ")";
        }

        copy_name = base_name.trim() + ' (Copy ' + ++highest_num + ')';

        return copy_name;
      };
    } else {
      Utils.fadeInPrimaryModal();

      generateCopyName = function () {
        let copy_num = 0;
        // inspect owned templates to generate copy name
        for (let qnaire_template of Questionnaires.templates.filter((template) => template.owner === Content.user)) {
          if (
            qnaire_template.version === questionnaire.uuid ||
            qnaire_template.uuid === questionnaire.uuid ||
            qnaire_template.version === questionnaire.version
          )
            copy_num++;
        }
        if (!copy_num) copy_num++;

        let base_name = questionnaire.name;
        if (questionnaire.name.indexOf('(Copy ')) base_name.substring(0, questionnaire.name.indexOf('(Copy '));

        return base_name.trim() + ' (Copy ' + copy_num + ')';
      };

      hideCopyForm = function () {
        Utils.fadeOutPrimaryModal();
        $('#copy-questionnaire-form').fadeOut(300);
        setTimeout(function () {
          $('#copy-questionnaire-form').find('#new-questionnaire-name-field').val('');
        }, 300);
      };
    }

    $('#copy-questionnaire-form').fadeIn();
    $('#copy-questionnaire-form').find('#new-questionnaire-name-field').val(generateCopyName());
    $('#copy-questionnaire-form').find('.buttonBlue').unbind();
    $('#copy-questionnaire-form').find('.buttonCancel').unbind();
    $('#copy-questionnaire-form')
      .find('.buttonCancel')
      .click(function () {
        hideCopyForm();
      });

    $('#copy-questionnaire-form')
      .find('.buttonBlue')
      .click(function () {
        let new_questionnaire_name = $('#copy-questionnaire-form').find('#new-questionnaire-name-field').val();
        questionnaire.copy(new_questionnaire_name);
        hideCopyForm();
      });
  }

  copy(copied_questionnaire_name) {
    let questionnaire_original = this;
    let questionnaire_copy = {};
    let is_copy = true;

    let sections_callback = function (response_text) {
      // load our original template's sections/questions
      let original_template_response = JSON.parse(response_text);
      let sections = original_template_response.questionnaire.sections;

      // questionnaire.id = template.id;
      questionnaire_copy.uuid = Utils.generateUUID();
      questionnaire_copy.version = original_template_response.questionnaire.uuid;
      questionnaire_copy.subversion = original_template_response.questionnaire.subversion;
      // questionnaire_copy.owner = original_template_response.questionnaire.owner;
      questionnaire_copy.owner = Content.user;

      // don't keep reference to original if we are copying our OWN questionnaire
      // no need for updating the copy to the original if a user own's both
      if (questionnaire_original.owner === Content.user) {
        is_copy = false;
        questionnaire_copy.version = Utils.generateUUID();
        questionnaire_copy.subversion = Utils.generateUUID();
      }
      //
      questionnaire_copy.name = copied_questionnaire_name;
      questionnaire_copy.access = 'private';
      questionnaire_copy.description = original_template_response.questionnaire.description;

      // questionnaire_copy.errors = original_template_response.questionnaire.errors;
      // questionnaire_copy.required_default = original_template_response.questionnaire.required_default;
      // questionnaire_copy.allow_back = original_template_response.questionnaire.allow_back;
      //template properties
      //these are not database columns, but are found in questionnaire template payload

      // template.errors = response.questionnaire.errors;
      // template.end_text = response.questionnaire.end_text;
      // template.end_uuid = response.questionnaire.end_uuid;
      // template.allow_back = response.questionnaire.allow_back;
      // template.display_mode = response.questionnaire.display_mode;
      // template.required_default = response.questionnaire.required_default;
      //
      // for (let section of response.questionnaire.sections) new Section2(template, section, false);

      // template.addSectionGoTos();

      // for (let section of template.sections) sections.push(section.toJSON());
      // questionnaire_copy.sections = sections;
      // questionnaire_copy.sections = template.sections;

      let callback = function (response_text) {
        let response = JSON.parse(response_text);
        if (response.success === true) {
          let copied_questionnaire_template = new QuestionnaireTemplate(response.questionnaire, false, is_copy);

          copied_questionnaire_template.name = copied_questionnaire_name;
          copied_questionnaire_template.access = 'private';
          copied_questionnaire_template.description = original_template_response.questionnaire.description;
          copied_questionnaire_template.errors = original_template_response.questionnaire.errors;
          copied_questionnaire_template.required_default = original_template_response.questionnaire.required_default;
          copied_questionnaire_template.allow_back = original_template_response.questionnaire.allow_back;
          copied_questionnaire_template.errors = original_template_response.questionnaire.errors;
          copied_questionnaire_template.end_text = original_template_response.questionnaire.end_text;
          copied_questionnaire_template.end_uuid = original_template_response.questionnaire.end_uuid;
          copied_questionnaire_template.display_mode = original_template_response.questionnaire.display_mode;

          copied_questionnaire_template.editable = Questionnaires.EDITABLE_DEFAULT;

          copied_questionnaire_template.asset_embedding =
            original_template_response.questionnaire.asset_embedding !== undefined
              ? original_template_response.questionnaire.asset_embedding
              : Questionnaires.ASSET_EMBEDDING_DEFAULT;

          for (let section of sections) new Section(copied_questionnaire_template, section, false);
          copied_questionnaire_template.loaded = true;

          // copied_questionnaire_template.question_map = template.question_map;
          // copied_questionnaire_template.question_id_map = template.question_id_map;
          // copied_questionnaire_template.section_id_map = template.section_id_map;

          // update parent template
          // for (let section of copied_questionnaire_template.sections) {
          //     section.parent_template = copied_questionnaire_template;
          //     for (let question of section.questions) {
          //         question.section = section;
          //         question.parent_template = copied_questionnaire_template;
          //     }
          // }

          copied_questionnaire_template.save(true);
        }
      };

      Ajax.doPut(Questionnaires.url, callback, JSON.stringify(questionnaire_copy));

      // $(template.list_item).find(".buttonQuestionnaireView, .buttonQuestionnaireEdit, .buttonQuestionnaireCopy").removeClass("disabled");
    };

    Ajax.doGet(Questionnaires.url + questionnaire_original.id, sections_callback);
  }

  showUpdateForm(e) {
    e.stopPropagation();

    let template = this;

    Utils.fadeInPrimaryModal();
    $('#update-questionnaire-confirm-form').fadeIn(300);
    $('#confirm-update-questionnaire-button').unbind();
    $('#confirm-update-questionnaire-button').click(function (e) {
      template.update(e);
    });
  }

  update(e) {
    let template = this;

    if (template.is_copy) {
      let original = Questionnaires.getTemplateById(template.version);

      // must have an original template to copy from
      if (original) {
        let template = this;
        let callback = function (response_text) {
          let response = JSON.parse(response_text);

          //template properties
          //these are not database columns, they are only found in questionnaire template json payload

          // template.errors = response.questionnaire.errors;
          template.end_text = response.questionnaire.end_text;
          template.end_uuid = response.questionnaire.end_uuid;
          template.allow_back = response.questionnaire.allow_back;
          template.display_mode = response.questionnaire.display_mode;
          template.required_default = response.questionnaire.required_default;
          template.editable =
            response.questionnaire.editable !== undefined ? response.questionnaire.editable : Questionnaires.EDITABLE_DEFAULT;
          template.asset_embedding =
            response.questionnaire.asset_embedding !== undefined
              ? response.questionnaire.asset_embedding
              : Questionnaires.ASSET_EMBEDDING_DEFAULT;
          template.is_copy = true;

          template.sections = [];
          template.question_id_map = {};
          template.section_id_map = {};
          template.question_map = {};
          for (let section of response.questionnaire.sections) new Section(template, section, false);

          template.addSectionGoTos();
          template.loaded = true;

          template.updateItemCount();
          Utils.fadeOutPrimaryModal();
          $('#update-questionnaire-confirm-form').fadeOut(300);
          $('#confirm-update-questionnaire-button').unbind();
        };
        Ajax.doGet(Questionnaires.url + original.id, callback);
      } else {
        Utils.fadeOutPrimaryModal();
        $('#update-questionnaire-confirm-form').fadeOut(300);
        $('#confirm-update-questionnaire-button').unbind();
      }
    } else {
      Utils.fadeOutPrimaryModal();
      $('#update-questionnaire-confirm-form').fadeOut(300);
      $('#confirm-update-questionnaire-button').unbind();
    }

    e.stopPropagation();
  }

  setAccessIcon() {
    if (this.access === 'public') {
      $('#button-share-questionnaire').addClass('public-questionnaire');
      $(this.list_item).find('.QuestionnaireAccess').html(SVG.getCloudIconBlackQuestionnaires());
    } else {
      $('#button-share-questionnaire').removeClass('public-questionnaire');
      $(this.list_item).find('.QuestionnaireAccess').html(SVG.getCloudIconGreyQuestionnaires());
    }
  }

  changeAccess() {
    if (this.access === 'public') {
      this.access = 'private';
      $('#button-share-questionnaire').removeClass('public-questionnaire');
      $(this.list_item).find('.QuestionnaireAccess').html(SVG.getCloudIconGreyQuestionnaires());
    } else {
      this.access = 'public';
      $('#button-share-questionnaire').addClass('public-questionnaire');
      $(this.list_item).find('.QuestionnaireAccess').html(SVG.getCloudIconBlackQuestionnaires());
    }

    this.save();
  }

  //switch between view and edit modes
  toggleView() {
    let new_view;
    let question = this.getCurrentQuestion();

    //exiting edit mode
    if (this.edit_mode) {
      $('#button-reorder-questions, #button-add-question').addClass('hidden');
      $('#questionnaire-modal').fadeOut();
      $('#questionnaire-' + this.id + '-reorder-form').fadeOut();
    }

    //if current view is a question
    if (question) {
      //exiting edit mode
      if (this.edit_mode) {
        // this.save();
        if (this.current_question_index !== -1 && this.current_question_index !== this.getCurrentSection().questions.length) {
          //update map if location question
          //update question label values

          if (!question.label) {
            $(question.view_question_DOM).children('.questionText').html(Questionnaires.NO_QUESTION_TEXT);
            $(question.view_question_DOM).children('.questionText').addClass('redText');
          } else {
            $(question.view_question_DOM).children('.questionText').removeClass('redText');
          }
          // question.updateEmptyFields();
          $.each($(question.edit_question_DOM).find('.MultipleChoiceInput, textarea'), function (index, value) {
            $(value).val($(value).val());
          });
        }
      } else {
        //entering edit mode
        $('#button-reorder-questions, #button-add-question').removeClass('hidden');
        if (!question.heading) {
          $(question.view_question_DOM).children('p.headingText').addClass('hidden');
        } else {
          $(question.view_question_DOM).children('p.headingText').removeClass('hidden');
        }

        // question.makeEditable()
        question.setEditableAll();
      }

      new_view = this.edit_mode ? $(question.view_question_DOM) : $(question.edit_question_DOM);

      //current view is a section
    } else {
      if (this.getCurrentSection()) {
        new_view = this.edit_mode ? $(this.getCurrentSection().view_question_DOM) : $(this.getCurrentSection().edit_question_DOM);
        if (!this.edit_mode) $('#button-reorder-questions, #button-add-question').removeClass('hidden');
      } else {
        if (!this.edit_mode) {
          $('#button-reorder-questions').removeClass('disabled');
          $('#button-reorder-questions, #button-add-question').removeClass('hidden');
        }

        if (this.section_index === -1) {
          new_view = this.edit_mode ? $(this.info_page) : $(this.edit_info_page);
        } else if (this.section_index === this.sections.length) {
          new_view = this.edit_mode ? $(this.end_page) : $(this.edit_end_page);
        }
      }
    }

    //toggle between edit mode
    $('#button-edit-questionnaire').toggleClass('buttonEditItemsSelected');
    $('#button-edit-questionnaire').children('svg').toggleClass('sectionEditButtonSvgSelected');
    $('#questionnaire-view-template').children().not('.newQuestionModalForm').remove();
    $(new_view).appendTo($('#questionnaire-view-template'));
    if (Content.allowed_users.includes(Content.user)) $('#button-show-branching').removeClass('hidden');

    if (!this.edit_mode) {
      $(question.edit_question_DOM).find('textarea.questionField').outerHeight(42);
      $(question.edit_question_DOM)
        .find('textarea.questionField')
        .outerHeight($(question.edit_question_DOM).find('textarea.questionField').prop('scrollHeight'));
      $(question.edit_question_DOM).find('textarea.questionHeading').outerHeight(42);
      $(question.edit_question_DOM)
        .find('textarea.questionHeading')
        .outerHeight($(question.edit_question_DOM).find('textarea.questionHeading').prop('scrollHeight'));
      $(question.edit_question_DOM).find('textarea.instructionField').outerHeight(42);
      $(question.edit_question_DOM)
        .find('textarea.instructionField')
        .outerHeight($(question.edit_question_DOM).find('textarea.instructionField').prop('scrollHeight'));
      if (this.getCurrentQuestion()) this.getCurrentQuestion().setTextAreaHeight();
    } else {
      if (this.edit_mode) {
        let max_width = 0;
        let options = $(question.view_question_DOM).find('.questionOption');
        $(options).find('td p.questionnaireQuestion').width('auto');

        $.each($(question.view_question_DOM).find('.questionOption'), function (index, value) {
          if ($(value).find('td p.questionnaireQuestion').width() > max_width)
            max_width = $(value).find('td p.questionnaireQuestion').width();
        });

        $(question.view_question_DOM)
          .find('.questionOption')
          .children('td')
          .children('p.questionnaireQuestion')
          .css('width', max_width);
      }
    }

    if (question.constructor.name === 'LocationField') {
      question.view_mode_map.invalidateSize();
      question.edit_mode_map.invalidateSize();
    }

    this.edit_mode = !this.edit_mode;
  }

  scrollItemIntoView() {}

  getCurrentSection() {
    if (this.section_index === -1) {
      return false;
    }
    return this.sections[this.section_index];
  }

  getCurrentQuestion() {
    if (this.current_question_index === -1) return false;
    return this.getCurrentSection().questions[this.current_question_index];
  }

  changeQuestion() {
    $('.sectionScrollIconActive').removeClass('sectionScrollIconActive');
    if (this.edit_mode) $('#button-reorder-questions').removeClass('disabled');

    //intro
    if ((this.current_question_index === -1 && this.section_index === -1) || this.section_index === -1) {
      this.getInfo();
      // $("#intro-scroll-icon")[0].scrollIntoView();
      $('.sectionScrollIconActive').removeClass('sectionScrollIconActive');
      return;

      //end
    } else if (this.section_index === this.sections.length) {
      $('.sectionScrollIconActive').removeClass('sectionScrollIconActive');

      this.getEnd();
      // $("#end-scroll-icon")[0].scrollIntoView();
      return;
    } else {
      if (this.getCurrentSection()) $(this.getCurrentSection().scroll_icon).addClass('sectionScrollIconActive');
      $('#button-next-question, #button-previous-question').removeClass('disabled');

      if (this.edit_mode) $('#button-add-question, #button-reorder-questions').removeClass('disabled');

      //scroll icon into view
      // if (this.current_question_index) {
      //     $(".questionScrollIcon")[this.current_question_index].scrollIntoView({behavior: "smooth"});
      // } else {
      //     $(this.getCurrentSection().scroll_icon).children(".sectionScrollIcon")[0].scrollIntoView({behavior: "smooth"});
      // }
    }

    //add new question to template
    if (this.getCurrentQuestion()) {
      $('#questionnaire-view-template').children().not('.newQuestionModalForm').remove();
      let new_question = this.edit_mode
        ? $(this.getCurrentQuestion().edit_question_DOM)
        : $(this.getCurrentQuestion().view_question_DOM);
      $(new_question).appendTo($('#questionnaire-view-template'));

      if (this.edit_mode) {
        $(new_question).find('textarea.questionField').outerHeight(42);
        $(new_question)
          .find('textarea.questionField')
          .outerHeight($(new_question).find('textarea.questionField').prop('scrollHeight'));
        $(new_question).find('textarea.questionHeading').outerHeight(42);
        $(new_question)
          .find('textarea.questionHeading')
          .outerHeight($(new_question).find('textarea.questionHeading').prop('scrollHeight'));

        $(new_question).find('textarea.instructionField').outerHeight(42);
        $(new_question)
          .find('textarea.instructionField')
          .outerHeight($(new_question).find('textarea.instructionField').prop('scrollHeight'));

        // this.getCurrentQuestion().makeEditable()
        this.getCurrentQuestion().setEditableAll();
      }

      if (this.getCurrentQuestion().constructor.name === 'LocationField') {
        if (this.getCurrentQuestion().view_mode_map) this.getCurrentQuestion().view_mode_map.invalidateSize();
        if (this.getCurrentQuestion().edit_mode_map) this.getCurrentQuestion().edit_mode_map.invalidateSize();
      }

      if (this.getCurrentQuestion().constructor.name === 'RangeAnswer2') this.getCurrentQuestion().updateRangeEvents();
      // if (this.getCurrentQuestion().constructor.name === "SingleAnswer2" || this.getCurrentQuestion().constructor.name === "YesNo2") this.getCurrentQuestion().inspectErrors();

      // if (this.getCurrentQuestion().constructor.name === "SingleAnswer2" || this.getCurrentQuestion().constructor.name === "MultiAnswer2" || this.getCurrentQuestion().constructor.name === "YesNo2") {
      //     this.getCurrentQuestion().setOptionFieldsHeight();
      // }

      this.getCurrentQuestion().setTextAreaHeight();

      $('.questionScrollIcon, .sectionScrollIcon, .headerScrollIcon, .sectionScrollContainer').removeClass('iconActive');
      $(this.getCurrentSection().questions[this.current_question_index].scroll_icon).addClass('iconActive');
    } else {
      //or add section page to template

      $('#button-add-question, #button-reorder-questions').removeClass('disabled');
      $('#questionnaire-view-template').children().not('.newQuestionModalForm').remove();

      if (!this.getCurrentSection()) {
        this.getInfo();
        $('#questionnaire-view-template').scrollTop(0);
        return;
      }

      let new_question = this.edit_mode
        ? $(this.getCurrentSection().edit_question_DOM)
        : $(this.getCurrentSection().view_question_DOM);
      $(new_question).find('textarea.questionHeading').outerHeight(42);
      $(new_question)
        .find('textarea.questionHeading')
        .outerHeight($(new_question).find('textarea.questionHeading').prop('scrollHeight'));
      $(new_question).appendTo($('#questionnaire-view-template'));
      $('.questionScrollIcon, .sectionScrollIcon, .headerScrollIcon, .sectionScrollContainer').removeClass('iconActive');
      $(this.getCurrentSection().scroll_icon).children('.sectionScrollIcon').addClass('iconActive');
    }
  }

  deleteTemplate() {
    let template = this;
    let callback = function (response_text) {
      let response = JSON.parse(response_text);
      if (response.success) {
        $(template.list_item).remove();
        let index = Questionnaires.templates.indexOf(template);
        Questionnaires.templates.splice(index, 1);
        $('#modal-primary').fadeOut(300);
        $('#delete-questionnaire-form').fadeOut(300);
        $('.headerBackArrowIcon').click();
        if (Questionnaires.templates.filter((template) => template.owner === Content.user).length === 0)
          $('#questionnaire-info-message').show();
      }
    };
    Ajax.doDelete(Questionnaires.url + template.id, callback);
  }

  deleteSection() {
    let section = this.getCurrentSection();
    if (!section) {
      console.log("can't delete section");
      return;
    }

    $(section.view_question_DOM).remove();
    $(section.edit_question_DOM).remove();
    $(section.reorder_list_item).remove();
    $(section.dropdown_menu_item).remove();

    $(section.scroll_icon).remove();
    let index = this.sections.indexOf(section);
    this.sections.splice(index, 1);
    $('#modal-secondary').fadeOut(300);
    $('#delete-section-form, #delete-empty-section-form').fadeOut(300);

    this.updateItemCount();

    this.section_index--;
    if (!this.sections.length) this.section_index = -1;
    this.changeQuestion();

    // if (this.section_index === 0) {
    //     $(this.getCurrentSection().scroll_icon).children(".sectionScrollIcon").click();
    //     this.section_index = -1;
    // } else {
    //     this.section_index--;
    //     // $(this.getCurrentQuestion().scroll_icon).click();
    // }
  }

  moveSectionQuestion(section) {
    //move from current section to selected section parameter
    let questions = this.getCurrentSection().questions;
    section.questions = section.questions.concat(questions);
    this.updateItemCount();
  }

  deleteQuestion() {
    let question = this.getCurrentQuestion();
    delete this.question_id_map[question.id];

    $(question.view_question_DOM).remove();
    $(question.edit_question_DOM).remove();
    $(question.reorder_list_item).remove();
    $(question.scroll_icon).remove();
    let index = this.getCurrentSection().questions.indexOf(question);
    question.section.questions.splice(index, 1);

    $('#modal-secondary').fadeOut(300);
    $('#delete-question-form').fadeOut(300);
    this.updateItemCount(question.section);

    if (this.current_question_index === 0) {
      $(this.getCurrentSection().scroll_icon).children('.sectionScrollIcon').click();
      this.current_question_index = -1;
    } else {
      this.current_question_index--;
      $(this.getCurrentQuestion().scroll_icon).click();
    }
  }

  getItemById(id) {
    if (this.question_id_map[id]) {
      return this.question_id_map[id];
    } else {
      for (let section of this.sections) {
        if (section.id === id) return section;
      }

      // let has_sub_questions = ["SingleAnswer2", "MultiAnswer2", "YesNo2"]
      // //check for sub question
      // for (let section of this.sections) {
      //     for (let question of section.questions.filter(question => has_sub_questions.includes(question.constructor.name))) {
      //         for (let option of question.options) {
      //             if (option.sub_question) if (option.sub_question.id === id) return option.sub_question;
      //         }
      //     }
      // }
    }

    return null;
  }

  resizeItems(is_visible) {
    //handlers resizing of questionnaire items on window resize event
    let template = this;

    // function resizeTextAreas() {
    //     if (template.getCurrentQuestion().constructor.name === "SingleAnswer2") {
    //         template.getCurrentQuestion().setOptionFieldsHeight();
    //     }
    // }

    if (is_visible) {
      window.onresize = function () {
        if (template.getCurrentQuestion()) template.getCurrentQuestion().setTextAreaHeight();
      };
    } else {
      window.onresize = null;
    }
  }

  addSectionGoTos() {
    let template = this;

    let goto_label;
    let view_mode_goto_label;

    for (let section of template.sections) {
      goto_label = 'Next Section';
      view_mode_goto_label = 'Upon leaving section go to next section';

      if (section.go_to === undefined) continue;

      if (section.go_to) {
        if (section.go_to === template.end_uuid) {
          $(section.edit_question_DOM).find('.goToContainer').removeClass('redText');
          $(section.edit_question_DOM).find('.section-goto-label').html('End');
          $(section.view_question_DOM).find('p.goto-label').html('Upon leaving section go to end of questionnaire');
          continue;
        }

        let item = template.getItemById(section.go_to);

        if (item) {
          goto_label = item.constructor.name === 'Section' ? 'S' + item.num : 'Q' + item.template_question_num;
          view_mode_goto_label = 'Upon leaving section go to ' + goto_label;

          if (item.constructor.name === 'Section') {
            if (item.num < section.num) $(section.edit_question_DOM).find('.goToContainer').addClass('redText');
          } else {
            if (item.template_question_num < section.questions[section.questions.length - 1].template_question_num)
              $(section.edit_question_DOM).find('.goToContainer').addClass('redText');
          }
        }
      }

      $(section.edit_question_DOM).find('.section-goto-label').html(goto_label);
      $(section.view_question_DOM).find('p.goto-label').html(view_mode_goto_label);
    }
  }

  updateSectionGoTos() {
    // console.log("updating go tos")

    let template = this;

    //updates section gotos and adds error styling if invalid

    for (let section of template.sections) {
      let error = false;

      if (section.go_to) {
        if (section.go_to === template.end_uuid) {
          $(section.edit_question_DOM).find('.goToContainer').removeClass('redText');
          continue;
        }

        let item = template.getItemById(section.go_to);

        if (item) {
          if (item.constructor.name === 'Section') {
            if (item.num <= section.num) error = true;
            $(section.edit_question_DOM)
              .find('.section-goto-label')
              .html('S' + item.num);
            $(section.view_question_DOM)
              .find('p.goto-label')
              .html('Upon leaving section go to S' + item.num);
          }
        }
      }

      section.updateError(error);
    }
  }

  drawBranches() {
    let template = this;
    let container = $(template.branching_form).find('.show-branching-container');
    $(container).find('.branch-section-node, .branch-node, .branch-line-wrapper, .branch-line-wrapper-clone').remove();
    $(container).scrollTop(0);

    DOM.new({
      tag: 'div',
      class: 'branch-section-node branch-info-node',
      parent: container,
      children: [{ tag: 'p', class: 'branch-node-label', html: 'Info' }],
    });

    for (let section of template.sections) {
      $(section.branching_icon).appendTo(container);
      for (let question of section.questions) $(question.branching_icon).appendTo(container);
    }

    DOM.new({
      tag: 'div',
      class: 'branch-section-node branch-end-node',
      parent: container,
      children: [{ tag: 'p', class: 'branch-node-label', html: 'End' }],
    });

    //todo
    //modify this code such that branches are not drawn in order, rather are drawn based upon their total distance so that there is as little branch overlap as possible

    let max_line_width = 100;
    let total_num_nodes = 0;
    for (let section of template.sections) {
      for (let question of section.questions) {
        if (question.hasOwnProperty('options')) {
          for (let option of question.options) if (option.go_to) total_num_nodes += 1;
        }
      }
    }

    let offset;

    if (total_num_nodes) {
      if (total_num_nodes > 1) {
        max_line_width = $(container).width() / 8;
        offset = (max_line_width / total_num_nodes) * 1.3;
      } else {
        //default values for only one
        max_line_width = 70;
        offset = 0;
      }
    }

    //draws branches on show branching form
    for (let section of template.sections) {
      // draw section branches
      // if (section.go_to) {
      //     let target;
      //     let num_nodes = 1;
      //     target = template.getItemById(section.go_to);
      //
      //     let offset = 0;
      //     if (num_nodes === 1 || num_nodes === 2) offset = 30;
      //     if (num_nodes === 3 || num_nodes === 4) offset = 40;
      //     if (num_nodes === 5 || num_nodes === 6) offset = 50;
      //
      //     let start = $(section.branching_icon).position().top + offset;
      //     let end = (section.go_to === template.end_uuid) ? $(".show-branching-container").find(".branch-end-node").position().top + offset : $(target.branching_icon).position().top + offset;
      //     let option_label = (section.label.length > 10) ? section.label.substring(0, 11) + "..." : section.label;
      //     let svg = SVG.getBranchingLine(end - start, num_nodes);
      //
      //     //arrow object
      //     let branch_arrow = DOM.new({
      //         tag: "div",
      //         id: "section-" + section.id + "-node-" + num_nodes,
      //         class: "branch-line-wrapper",
      //         style: "top: " + start + "px",
      //         html: svg,
      //         parent: container,
      //         children: [
      //             {tag: "p", class: "branch-line-label", html: option_label}
      //         ]
      //     })
      //     let width = $(branch_arrow).find("polyline")[0].getBBox().width;
      //     let height = $(branch_arrow).find("polyline")[0].getBBox().height;
      //
      //     $(branch_arrow).children("svg").width(width);
      //     $(branch_arrow).children("svg").height(height)
      //     let text_offset = (num_nodes % 2 === 0) ? (-width - 48) + "px" : (width - 20) + "px";
      //     $(branch_arrow).find(".branch-line-label").css("left", text_offset);
      //
      // }

      //todo draw branches and order by length?? one possible way to prevent overlapping arrows

      //draw question branches
      for (let question of section.questions) {
        let target;
        let num_nodes = 0;
        if (question.hasOwnProperty('options')) {
          for (let option of question.options) {
            if (option.go_to) {
              num_nodes += 1;
              target = template.getItemById(option.go_to);

              if (!target) continue;
              let start_offset = 0;
              let end_offset = 0;

              if (num_nodes === 1 || num_nodes === 2) {
                start_offset = 20;
                end_offset = 60;
              }
              if (num_nodes === 3 || num_nodes === 4) {
                start_offset = 40;
                end_offset = 40;
              }
              if (num_nodes === 5 || num_nodes === 6) {
                start_offset = 60;
                end_offset = 20;
              }

              let start = $(question.branching_icon).position().top + start_offset;
              let end =
                option.go_to === template.end_uuid
                  ? $(container).find('.branch-end-node').position().top + end_offset
                  : $(target.branching_icon).position().top + end_offset;

              if (question.template_question_num > target.template_question_num) {
                start = $(target.branching_icon).position().top + end_offset;
                end = $(question.branching_icon).position().top + start_offset;
              }

              let option_label = option.label.length > 10 ? option.label.substring(0, 11) + '...' : option.label;
              let line_height = end - start;

              let svg = SVG.getBranchingLine(line_height, max_line_width, false, num_nodes);

              //arrow object
              let id = 'question-' + question.id + '-node-' + num_nodes;
              let arrow_class = num_nodes % 2 === 1 ? 'branch-arrow-right' : 'branch-arrow-left';
              let line_class = num_nodes % 2 === 1 ? 'branch-line-left' : 'branch-line-right';

              let offset_class = null;
              if (option.go_to === template.end_uuid) {
                offset_class = num_nodes % 2 === 1 ? 'branch-section-arrow-right' : 'branch-section-arrow-left';
                arrow_class += ' ';
                arrow_class += offset_class;
              }

              if (target)
                if (target.constructor.name === 'Section') {
                  offset_class = num_nodes % 2 === 1 ? 'branch-section-arrow-right' : 'branch-section-arrow-left';
                  arrow_class += ' ';
                  arrow_class += offset_class;
                }

              let branch_line = DOM.new({
                tag: 'div',
                id: id,
                class: 'branch-line-wrapper',
                style: 'top: ' + start + 'px',
                html: svg,
                parent: container,
                children: [
                  { tag: 'div', class: arrow_class },
                  { tag: 'p', class: 'branch-line-label', html: option_label },
                ],
              });

              let width = $(branch_line).find('polyline')[0].getBBox().width;
              let height = $(branch_line).find('polyline')[0].getBBox().height;

              $(branch_line).children('svg').width(width);
              $(branch_line).children('svg').height(height);
              let text_offset = num_nodes % 2 === 1 ? -width - 48 + 'px' : width - 20 + 'px';
              $(branch_line).find('.branch-line-label').css('left', text_offset);
              // let arrow_offset =

              if (offset_class) {
                $(branch_line)
                  .children('.' + offset_class)
                  .css('top', $(branch_line).children('svg').height() - 6 + 'px');
              } else {
                $(branch_line)
                  .children('.' + arrow_class)
                  .css('top', $(branch_line).children('svg').height() - 6 + 'px');
              }

              if (question.template_question_num > target.template_question_num) {
                $(branch_line)
                  .children('.' + arrow_class)
                  .css('top', '-4px');
                $(branch_line).addClass('branch-line-error');
              }

              //create a slightly wider transparent clone to increase clickable area for branch line
              svg = SVG.getBranchingLine(line_height + 10, max_line_width, true, num_nodes);

              if (num_nodes % 2 === 0) {
                max_line_width = max_line_width - offset;
              }

              // max_line_width = max_line_width - (offset / 3);

              let branch_arrow_clickable_clone = DOM.new({
                tag: 'div',
                id: 'question-' + question.id + '-node-' + num_nodes + '-clone',
                class: 'branch-line-wrapper-clone ' + line_class,
                style: 'top: ' + (start - 5) + 'px',
                html: svg,
                parent: container,
              });

              width = $(branch_arrow_clickable_clone).find('polyline')[0].getBBox().width;
              height = $(branch_arrow_clickable_clone).find('polyline')[0].getBBox().height;

              $(branch_arrow_clickable_clone).children('svg').width(width);
              $(branch_arrow_clickable_clone).children('svg').height(height);

              //mouse events for clone clickable area
              $(branch_arrow_clickable_clone)
                .find('polyline')
                .click(function (e) {
                  e.stopPropagation();
                });

              $(branch_arrow_clickable_clone)
                .find('polyline')
                .mousemove(function (e) {
                  let option_index = question.options.indexOf(option);
                  question.showBranchToolTip(e, option_index);
                });

              $(branch_arrow_clickable_clone)
                .find('polyline')
                .mouseover(function (e) {
                  let option_index = question.options.indexOf(option);
                  question.showBranchToolTip(e, option_index);
                  let svg = $(branch_line).children('svg');
                  if (!$(svg).hasClass('branch-selected')) {
                    //fade all other lines on hover
                    $(container).find('svg.branch-line').addClass('branch-faded').removeClass('branch-hover');
                    $(container)
                      .find('#' + id)
                      .children('svg')
                      .addClass('branch-hover')
                      .removeClass('branch-faded');
                  } else {
                    $(svg).addClass('branch-hover');

                    $('.question-flow-info-panel .goto_tooltip_row').addClass('hidden');
                    $($('.question-flow-info-panel .goto_tooltip_row')[option_index]).removeClass('hidden');
                  }
                });

              $(branch_arrow_clickable_clone)
                .find('polyline')
                .mouseleave(function () {
                  let svg = $(branch_line).children('svg');
                  if ($(svg).hasClass('branch-hover')) $(svg).removeClass('branch-hover');

                  if ($(svg).hasClass('branch-selected')) {
                    $(container)
                      .find('#' + id)
                      .children('svg')
                      .removeClass('branch-hover');
                    $('.question-flow-info-panel .goto_tooltip_row').removeClass('hidden');
                  } else {
                    $(container).find('svg.branch-line').removeClass('branch-faded');

                    if (question.parent_template.question_flow_active_question) {
                      question.parent_template.question_flow_active_question.showQuestionFlowPanel();
                    } else {
                      $('.question-flow-info-panel').hide();
                    }
                  }

                  $('.question-flow-tooltip').addClass('hidden');
                  $('.question-flow-tooltip').width('auto');
                });
            }
          }
        }
      }
    }
  }

  setError() {
    let template = this;
    if (!template.errors) {
      return null;
    }

    let errors = [];

    for (let error of template.errors) {
      let question = template.getItemById(error);
      if (question) errors.push('invalid_Q' + question.template_question_num);
    }

    for (let section of template.sections) {
      for (let question of section.questions.filter(
        (question) => question.constructor.name === 'SingleAnswer2' || question.constructor.name === 'YesNo2'
      )) {
        if (question.inspectGoTos()) {
          errors.push('invalid_branching');
          break;
        }
      }
    }

    // if (!errors.length) return "";

    if (!errors.length) return null;

    //used to return null

    // return JSON.stringify(errors);
    return errors;
  }

  //save edits
  save(is_quicksave) {
    let timer = is_quicksave ? 0 : 400;
    let template = this;
    if (template.save_timer) clearTimeout(template.save_timer);

    //can only save questionnaires you own
    if (template.owner !== Content.user) return;

    $('#questionnaire-save-indicator').fadeIn();
    $('#questionnaire-save-indicator').html('Saving changes...');

    template.save_timer = setTimeout(function () {
      //converts class objects to json and saves to server
      let questionnaire = {};
      let sections = [];
      for (let section of template.sections) sections.push(section.toJSON());

      questionnaire.id = template.id;
      questionnaire.uuid = template.uuid;
      questionnaire.version = template.uuid;
      questionnaire.subversion = template.subversion;
      questionnaire.owner = template.owner;
      questionnaire.name = template.name;
      questionnaire.access = template.access ? template.access : 'private';
      questionnaire.description = template.description;
      questionnaire.sections = sections;

      questionnaire.allow_back = template.allow_back !== undefined ? template.allow_back : true;
      questionnaire.required_default =
        template.required_default !== undefined ? template.required_default : Questionnaires.REQUIRED_DEFAULT;
      questionnaire.asset_embedding =
        template.asset_embedding !== undefined ? template.asset_embedding : Questionnaires.ASSET_EMBEDDING_DEFAULT;
      questionnaire.editable = Questionnaires.EDITABLE_DEFAULT;
      questionnaire.display_mode = template.display_mode ? template.display_mode : 'multi';
      questionnaire.end_text = template.end_text !== undefined ? template.end_text : 'End';
      questionnaire.end_uuid = template.end_uuid !== undefined ? template.end_uuid : Utils.generateUUID();
      questionnaire.errors = template.setError();

      //is copy
      questionnaire.is_copy = template.is_copy;

      $('#questionnaire-' + template.id + '-name-field').html(template.name);
      $('#questionnaire-' + template.id + '-description-field').html(template.description);

      let callback = function (response_text) {
        let response = JSON.parse(response_text);
        if (response.success) {
          $('#questionnaire-save-indicator').html('All changes saved.');
          setTimeout(function () {
            $('#questionnaire-save-indicator').fadeOut();
          }, 3000);
          setTimeout(function () {
            $('#questionnaire-save-indicator').html('');
          }, 3400);
        } else {
          $('#questionnaire-save-indicator').html('Unable to save contents. Try again.');
        }
      };

      Ajax.doPost(Questionnaires.url + template.id, callback, JSON.stringify(questionnaire));

      // console.log(questionnaire)
    }, timer);
  }
}

Questionnaires.getPublicQuestionnaires2 = function (e) {
  if (!Questionnaires.publicQuestionnaires_IS_VISIBLE) {
    $('#button-public-questionnaires').css('background-color', 'white').css('color', 'hsl(200, 75%, 30%)');
    $('#button-public-questionnaires').children('svg').addClass('sectionEditButtonSvgSelected').removeClass('sectionEditButtonSvg');

    if (Questionnaires.TEMPLATES_LOADED) {
      let owner = Content.publicQuestionnaires[i]['owner'];

      //check if profiles list loaded
      if (Profiles.list) {
        //check if profile is in memory
        if (!Profiles.getProfile(owner)) {
          let store_profile = function (response_text) {
            let response = JSON.parse(response_text);
            if (response['success'] === true) {
              let profile = response.profile;
              Profiles.list.push(profile);
              localStorage.setItem('profiles', JSON.stringify(Profiles.list));
              owner = profile.first_name + ' ' + profile.last_name;
            }
          };

          Ajax.doGet('/services/profile/cache?username=' + owner, store_profile);
        } else {
          owner = Profiles.getProfile(owner)['first_name'] + ' ' + Profiles.getProfile(owner)['last_name'];
        }
      } else {
        //use local storage if profiles not yet in memory
        if (localStorage.getItem('profiles')) {
          let profiles = JSON.parse(localStorage.getItem('profiles'));

          for (let profile of profiles) {
            if (profile.username === owner) owner = profile.first_name + ' ' + profile.last_name;
          }
        }
      }
    }

    let xhr = new XMLHttpRequest();
    xhr.open('GET', questionnaires_url);
    xhr.send();
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        // Content.sessionEndLogout(xhr);
        // Content.updateMyQuestionnaires(xhr);

        let public_questionnaires = [];

        public_questionnaires.push({
          tag: 'tr',
          class: 'placeholder-header',
          children: [
            {
              tag: 'td',
              class: 'metadataItemHead',
              children: [{ tag: 'p', class: 'tableHeader', html: 'Select to copy from public template' }],
            },
          ],
        });

        //TODO change to iterate through public questionnaires list for staging/live

        for (let i = 0; i < Content.publicQuestionnaires.length; i++) {
          // let id = "questionnaire-template-" + Content.publicQuestionnaires[i]["id"];
          let owner = Content.publicQuestionnaires[i]['owner'];

          //check if profiles list loaded
          if (Profiles.list) {
            //check if profile is in memory
            if (!Profiles.getProfile(owner)) {
              let store_profile = function (response_text) {
                let response = JSON.parse(response_text);
                if (response['success'] === true) {
                  let profile = response.profile;
                  Profiles.list.push(profile);
                  localStorage.setItem('profiles', JSON.stringify(Profiles.list));
                  owner = profile.first_name + ' ' + profile.last_name;
                }
              };

              Ajax.doGet('/services/profile/cache?username=' + owner, store_profile);
            } else {
              owner = Profiles.getProfile(owner)['first_name'] + ' ' + Profiles.getProfile(owner)['last_name'];
            }
          } else {
            //use local storage if profiles not yet in memory
            if (localStorage.getItem('profiles')) {
              let profiles = JSON.parse(localStorage.getItem('profiles'));

              for (let profile of profiles) {
                if (profile.username === owner) owner = profile.first_name + ' ' + profile.last_name;
              }
            }
          }

          public_questionnaires.push({
            tag: 'tr',
            id: 'questionnaire-template-' + Content.publicQuestionnaires[i]['id'],
            children: [
              { tag: 'td', children: [{ tag: 'p', class: 'tableValue', html: Content.publicQuestionnaires[i]['name'] }] },
              { tag: 'td', children: [{ tag: 'p', class: 'tableExtra', html: owner }] },
              {
                tag: 'td',
                children: [
                  {
                    tag: 'button',
                    class: 'buttonCopy',
                    label: 'Copy',
                    up_action: function () {
                      Content.showCopyQuestionnaireModal($(this));
                    },
                  },
                ],
              },
            ],
          });
        }

        if ($('#public-questionnaires-dropdown').length > 0) {
          $('#public-questionnaires-dropdown').children('.dropDownListTable').remove();
          let table = DOM.new({
            tag: 'table',
            class: 'dropDownListTable',
            children: public_questionnaires,
            parent: $('#public-questionnaires-dropdown'),
          });
        } else {
          DOM.new({
            tag: 'div',
            id: 'public-questionnaires-dropdown',
            class: 'publicChecklistDropDownList',
            style: 'left: 10px; margin: 0',
            children: [{ tag: 'table', class: 'dropDownListTable', children: public_questionnaires }],
            parent: $('#questionnaires-container'),
          });
        }

        $('#public-questionnaires-dropdown').css('transform', 'translateY(0%)');
        setTimeout(function () {
          //descending
          $('#public-questionnaires-dropdown').css('transform', 'translateY(calc(100% + 10px)');
        }, 100);

        Questionnaires.publicQuestionnaires_IS_VISIBLE = true;
        // e.stopPropagation()
      }
    };
  } else {
    $('#button-public-questionnaires').css('background-color', 'hsl(200, 75%, 30%)').css('color', 'white');
    $('#button-public-questionnaires').children('svg').removeClass('sectionEditButtonSvgSelected').addClass('sectionEditButtonSvg');

    $('#public-questionnaires-dropdown').css('transform', 'translateY(0%)');

    Questionnaires.publicQuestionnaires_IS_VISIBLE = false;
  }
  e.stopPropagation();
};
Questionnaires.createQuestionnaire = function () {
  let questionnaire = {};
  // questionnaire.username = Content.user;
  questionnaire.uuid = Utils.generateUUID();
  questionnaire.version = questionnaire.uuid;
  questionnaire.subversion = '1';
  questionnaire.name = $('#questionnaire-name').val();
  questionnaire.description = $('#questionnaire-desc').val();
  questionnaire.access = 'private';
  questionnaire.sections = [{ id: Utils.generateUUID(), label: '', go_to: null, questions: [] }];
  questionnaire.required_default = Questionnaires.REQUIRED_DEFAULT;
  questionnaire.allow_back = Questionnaires.ALLOW_BACK_DEFAULT;
  questionnaire.asset_embedding = Questionnaires.ASSET_EMBEDDING_DEFAULT;
  questionnaire.end_text = 'End';
  questionnaire.end_uuid = Utils.generateUUID();
  questionnaire.errors = null;

  //todo make sure that section is created before opening view panel
  let callback = function (response_text) {
    // console.log(response_text)

    let response = JSON.parse(response_text);

    if (response.success) new QuestionnaireTemplate(response.questionnaire, true);
    Questionnaires.sortTemplates();
  };

  Ajax.doPut(Questionnaires.url, callback, JSON.stringify(questionnaire));
  $('#modal-secondary, #modal-primary').fadeOut(300);
  $('#add-questionnaire-form').fadeOut(300);
};

//generate from existing json
Questionnaires.generateQuestionnaire = function (json) {
  // let questionnaire = {};

  let questionnaire = json.questionnaire ? json.questionnaire : json;
  delete questionnaire.id;

  questionnaire.uuid = Utils.generateUUID();
  questionnaire.version = questionnaire.uuid;
  questionnaire.subversion = '1';
  questionnaire.owner = Content.user;
  questionnaire.name = questionnaire.name + '-backup';
  questionnaire.access = 'private';
  // questionnaire.sections = [{id : Utils.generateUUID(), "label": "", "go_to": null, "questions": []}];
  questionnaire.required_default = Questionnaires.REQUIRED_DEFAULT;
  questionnaire.allow_back = Questionnaires.ALLOW_BACK_DEFAULT;
  questionnaire.end_text = 'End';
  questionnaire.end_uuid = Utils.generateUUID();

  // questionnaire.sections = [{id : Utils.generateUUID(), "label": "", "go_to": null, "questions": []}];

  //todo make sure that section is created before opening view panel
  let callback = function (response_text) {
    let response = JSON.parse(response_text);
    if (response.success === true) {
      let template = new QuestionnaireTemplate(response.questionnaire);
      setTimeout(function () {
        template.edit_mode = true;
        template.view();
      }, 350);
    }
  };

  Ajax.doPut(Questionnaires.url, callback, JSON.stringify(questionnaire));
  $('#modal-secondary, #modal-primary').fadeOut(300);
  $('#add-questionnaire-form').fadeOut(300);

  // let questionnaire = {};
  // questionnaire.name = $("#questionnaire-name").val();
  // questionnaire.description = $("#questionnaire-desc").val();
  // questionnaire.access = "private";
  // questionnaire.sections = [{id : Utils.generateUUID(), "label": "", "go_to": null, "questions": []}];
  //
  //
  // //todo make sure that section is created before opening view panel
  // let callback = function (response_text) {
  //     let response = JSON.parse(response_text);
  //     if (response.success === true) {
  //         let template = new QuestionnaireTemplate2(response.questionnaire);
  //         setTimeout(function () {
  //             template.edit_mode = true;
  //             template.view();
  //         }, 350)
  //     }
  // };
  // Ajax.doPut(Questionnaires2.url, callback, JSON.stringify(questionnaire));
  // $("#modal-secondary, #modal-primary").fadeOut(300);
  // $("#add-questionnaire-form").fadeOut(300);
};

//create new template using add item button
// Questionnaires2.createQuestionnaire = function () {
//
//     let questionnaire = {};
//     questionnaire.uuid = Utils.generateUUID();
//     questionnaire.name = $("#questionnaire-name").val();
//     questionnaire.description = $("#questionnaire-desc").val();
//     questionnaire.access = "private";
//     questionnaire.sections = [{id : Utils.generateUUID(), "label": "", "go_to": null, "questions": []}];
//     // questionnaire.required_default = Questionnaires2.REQUIRED_DEFAULT;
//
//     //todo make sure that section is created before opening view panel
//     let callback = function (response_text) {
//         let response = JSON.parse(response_text);
//         if (response.success === true) {
//             let template = new QuestionnaireTemplate2(response.questionnaire);
//             setTimeout(function () {
//                 template.edit_mode = true;
//                 template.view();
//             }, 350)
//         }
//     };
//     Ajax.doPut(Questionnaires2.url, callback, JSON.stringify(questionnaire));
//     $("#modal-secondary, #modal-primary").fadeOut(300);
//     $("#add-questionnaire-form").fadeOut(300);
//
// };

Questionnaires.toggleSectionMenu = function () {
  if (!Questionnaires.projectMenuVisible) {
    Utils.fadeIn($('#questionnaire-dropdown-section-menu'), 'block', 350);
    $('#delete-section-form').find('.buttonDropdown').addClass('rotate180');
    $('#delete-section-form')
      .find('.buttonCancelForm, .buttonDeleteSection, .radioButton, .wrapper')
      .removeClass('clickable')
      .addClass('unclickable');
    // $("#delete-section-form").find(".wrapper, .radioButton").first().addClass("blur");
    Questionnaires.projectMenuVisible = true;
  } else {
    $('#delete-section-form')
      .find('.buttonCancelForm, .buttonDeleteSection, .wrapper')
      .removeClass('unclickable')
      .addClass('clickable');

    // $("#delete-section-form").find(".questionReorderControlBar, .formTitle, .reorderQuestionControlBar").removeClass("blur");
    // $("#delete-section-form").find(".wrapper").first().removeClass("blur");
    Utils.fadeOutCrossBrowser($('#questionnaire-dropdown-section-menu'), 350);
    $('#delete-section-form').find('.buttonDropdown').removeClass('rotate180');
    Questionnaires.projectMenuVisible = false;
  }
};


//parent types
class Section {
  //starting with default 1 section
  constructor(parent_template, metadata, is_new) {
    if (metadata) this.metadata = metadata;
    for (let property in metadata) this[property] = metadata[property];

    // this.order = metadata.order;
    this.questions = [];
    this.questions_metadata = metadata.questions;
    this.parent_template = parent_template;
    this.label = metadata.label ? metadata.label : '';

    if (!this.hasOwnProperty('go_to')) this.go_to = null;

    this.num = parent_template.sections.length + 1;
    //todo add this to goto functions
    this.scroll_label = 'S' + this.num;
    let section = this;

    this.scroll_icon = DOM.new({
      tag: 'div',
      class: 'sectionScrollContainer',
      children: [
        {
          tag: 'div',
          class: 'sectionScrollIcon',
          html: 'S' + this.num,
          click: function () {
            section.getPage();
          },
        },
      ],
    });

    this.branching_icon = DOM.new({
      tag: 'div',
      class: 'branch-section-node unclickable',
      children: [{ tag: 'p', class: 'branch-node-label', html: this.scroll_label }],
      click: function (e) {
        //
        // let container = $(this.parent_template.branching_form).find(".show-branching-container");
        //
        //     e.stopPropagation();
        //
        //     $(container).find(".branch-selected").removeClass("branch-selected");
        //
        //     $.each($(container).find(".branch-line"), function(index, value) {
        //         if ($(value).parent().attr("id")) {
        //             if ($(value).parent().attr("id").includes(section.id)) {
        //                 $(value).addClass("branch-selected").removeClass("branch-faded");
        //             }
        //         }
        //     })
        //     $(".branch-line").not(".branch-line.branch-selected").addClass("branch-faded")
      },
      mouseover: function (e) {
        // e.stopPropagation();
        //
        // let container = $(section.parent_template.branching_form).find(".show-branching-container");
        // $(container).find(".branch-hover").removeClass("branch-hover");
        //
        // $.each($(container).find(".branch-line"), function(index, value) {
        //     if ($(value).parent().attr("id")) {
        //         if ($(value).parent().attr("id").includes(section.id)) {
        //             $(value).addClass("branch-hover");
        //         }
        //     }
        // })
      },
      mouseleave: function () {
        // let container = $(section.parent_template.branching_form).find(".show-branching-container");
        //
        // $.each($(container).find(".branch-line"), function(index, value) {
        //     if ($(value).parent().attr("id")) {
        //         if ($(value).parent().attr("id").includes(section.id)) {
        //             $(value).removeClass("branch-hover");
        //         }
        //     }
        // })
      },
    });

    this.view_question_DOM = DOM.new({
      tag: 'div',
      class: 'questionWrapper section-wrapper',
      children: [
        { tag: 'p', class: 'questionNumber', html: 'S' + this.num },
        { tag: 'p', class: 'questionType', html: 'Section' },
        { tag: 'p', class: 'headingText', html: this.label },
        { tag: 'div', class: 'wrapper-flex align-right', children: [{ tag: 'p', class: 'goto-label' }] },
      ],
    });

    this.edit_question_DOM = DOM.new({
      tag: 'div',
      class: 'questionWrapper section-wrapper',
      children: [
        { tag: 'p', class: 'questionNumber', html: 'S' + this.num },
        { tag: 'p', class: 'questionType', html: 'Section' },
        section.getHeadingField(),
        {
          tag: 'div',
          class: 'wrapper-flex vertical-padding-medium align-right',
          children: [
            { tag: 'p', class: 'field-label horizontal-padding-small', html: 'Upon leaving section go to...' },
            {
              tag: 'div',
              class: 'goToContainer noMargin',
              children: [
                {
                  tag: 'div',
                  class: 'goToMenuButton',
                  click: function (e) {
                    let button = this;
                    section.toggleGoToMenu(e, button);
                  },
                  children: [
                    {
                      tag: 'table',
                      class: 'fullSize',
                      children: [
                        {
                          tag: 'tr',
                          children: [
                            {
                              tag: 'td',
                              class: '',
                              children: [{ tag: 'p', class: 'menuButtonLabel section-goto-label' }],
                            },
                            {
                              tag: 'td',
                              class: '',
                              children: [
                                { tag: 'div', class: 'buttonDropdown' },
                                {
                                  tag: 'div',
                                  class: 'buttonDeleteGoTo hidden',
                                  html: SVG.getBlackCloseOutIcon(),
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                    {
                      tag: 'div',
                      class: 'goToDropDownMenu hideScrollBar',
                      click: function (e) {
                        // e.preventDefault();
                        // e.stopPropagation();
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          tag: 'div',
          class: 'wrapper verticalPadding',
          children: [
            {
              tag: 'button',
              class: 'buttonDeleteQuestion',
              label: 'Delete Section',
              up_action: function () {
                section.getDeleteSectionForm();
              },
            },
          ],
        },
      ],
    });

    if (parent_template.constructor.name === 'Questionnaire') {
      parent_template.sections.push(this);
      this.parent_template.section_id_map[this.id] = this;
      this.getQuestions();
      return;
    }

    this.dropdown_menu_item = DOM.new({
      tag: 'div',
      class: 'projectMenuItem',
      html: 'Section ' + this.num,
      parent: $('#questionnaire-dropdown-section-menu'),
      click: function (e) {
        e.stopPropagation();
        if (!$(this).hasClass('sectionItemActive')) {
          $('#delete-section-form').find('.sectionItemActive').removeClass('sectionItemActive');
          $(this).addClass('sectionItemActive');
          parent_template.section_to_move_to = section;
          $('#delete-section-form')
            .find('.projectMenuButtonText')
            .html('Section ' + section.num);

          setTimeout(function () {
            Questionnaires.toggleSectionMenu();
            // $("#delete-section-form").find(".sectionProjectMenu").fadeOut(300);
          }, 500);
        }
      },
    });

    this.reorder_list_item = DOM.new({
      tag: 'div',
      id: 'qnaire-' + parent_template.id + '-section-' + section.num,
      class: 'wrapperNoPad',
      children: [
        {
          tag: 'div',
          class: 'buttonExpandSection',
          html: SVG.getBlackMinusSign(),
          click: function () {
            if (
              $(section.reorder_list_item)
                .children('.reorderSectionListItem')
                .children('.wrapperNoPad')
                .hasClass('sectionCollapsed')
            ) {
              $(this).html(SVG.getBlackMinusSign());
              $(section.reorder_list_item)
                .children('.reorderSectionListItem')
                .children('.wrapperNoPad')
                .removeClass('sectionCollapsed');
              $(section.reorder_list_item)
                .find('.reorderSectionListItem')
                .css('height', $(section.reorder_list_item).find('.indent').height() + 55);
            } else {
              $(this).html(SVG.getBlackPlusSign());
              $(section.reorder_list_item)
                .children('.reorderSectionListItem')
                .children('.wrapperNoPad')
                .addClass('sectionCollapsed');
              $(section.reorder_list_item).find('.reorderSectionListItem').css('height', '55px');
            }
          },
        },
        {
          tag: 'div',
          class: 'reorderSectionListItem clickable hideScrollBar',
          mousedown: function (e) {
            if ($(e.target).hasClass('reorderSectionListItem')) {
              $(this).addClass('originalQuestionPlaceholder');
            }
          },
          mouseup: function () {
            $(this).removeClass('originalQuestionPlaceholder');
            $(parent_template.reorder_question_form).find('.reorderQuestionContainer').sortable();
            $(parent_template.reorder_question_form).find('.reorderQuestionContainer').sortable('refreshPositions');
            // parent_template.reorderSections();
          },
          children: [
            { tag: 'button', style: ['buttonMoveSection', 'unclickable'], label: SVG.getMoveQuestionnaireItemsIcon() },
            { tag: 'p', class: 'reorderSectionText unclickable', html: 'S' + this.num },
            {
              tag: 'div',
              class: 'wrapperNoPad indent unclickable hideScrollBar',
              style: 'min-height: 10px; padding-top: 47px; position: absolute; top: 0px; padding-bottom: 10px; width: calc(100% - 100px) !important;',
            },
            //todo should modify padding for section containers that have children. if children, reduce padding so that drop target matches up with section container!!
          ],
        },
      ],
    });

    $(this.reorder_list_item).insertBefore($(parent_template.reorder_question_form).find('.endSection'));

    if (is_new) {
      $('.newQuestionModalForm, #questionnaire-modal').fadeOut();
      parent_template.sections.splice(parent_template.section_index, 0, this);
      let new_question = parent_template.edit_mode ? $(this.edit_question_DOM) : $(this.view_question_DOM);
      $(new_question).appendTo($('#questionnaire-view-template'));
      $('.questionScrollIcon, .headerScrollIcon, .sectionScrollIcon, .sectionScrollContainer').removeClass('iconActive');
      $('.sectionScrollIconActive').removeClass('sectionScrollIconActive');
      $(this.scroll_icon).addClass('iconActive');
      $(this.scroll_icon).insertAfter($('.sectionScrollContainer').get(parent_template.section_index - 1));
      parent_template.current_question_index = -1;

      for (let i = 0; i < parent_template.sections.length; i++) {
        let num = i + 1;
        let section = parent_template.sections[i];
        $(section.view_question_DOM)
          .children('.questionNumber')
          .html('S' + num);
        $(section.edit_question_DOM)
          .children('.questionNumber')
          .html('S' + num);
        $(section.scroll_icon)
          .children('.sectionScrollIcon')
          .html('S' + num);
        section.num = num;
      }

      this.id = Utils.generateUUID();
      this.metadata.id = this.id;
      $(this.edit_question_DOM).find('p.menuButtonLabel').html('Next Section');
      $(this.view_question_DOM).find('p.goto-label').html('Upon leaving section go to next section');

      parent_template.updateItemCount();
    } else {
      parent_template.sections.push(this);
      // $(this.scroll_icon).appendTo($(".sectionScrollContainer"));
    }

    $(this.reorder_list_item).attr('id', 'section-' + section.id);
    this.parent_template.section_id_map[this.id] = this;
    this.getQuestions();
  }

  toJSON() {
    let json = {};
    for (let property in this) {
      if (Object.keys(this.metadata).includes(property)) {
        json[property] = this[property];
      }
    }

    return json;
  }

  getQuestions() {
    let template = this.parent_template;
    let question_num = 0;

    for (let question of this.questions_metadata) {
      template.num_questions++;
      question_num++;
      switch (question.type) {
        case 'Text Field': {
          new MultiText(question, template, question_num, template.num_questions, this, false);
          break;
        }
        case 'Multi Text': {
          new MultiText(question, template, question_num, template.num_questions, this, false);
          break;
        }
        case 'Yes / No': {
          new YesNo2(question, template, question_num, template.num_questions, this, false);
          break;
        }
        case 'Multi Select': {
          new MultiAnswer2(question, template, question_num, template.num_questions, this, false);
          break;
        }
        case 'Single Select': {
          new SingleAnswer2(question, template, question_num, template.num_questions, this, false);
          break;
        }
        case 'Matrix Multi Select':
        case 'Matrix Single Select':
        case 'Matrix': {
          new Matrix(question, template, question_num, template.num_questions, this, false);
          break;
        }

        case 'Number': {
          new NumberField(question, template, question_num, template.num_questions, this, false);
          break;
        }
        case 'DateTime': {
          new DateTime(question, template, question_num, template.num_questions, this, false);
          break;
        }

        case 'Location': {
          new LocationField(question, template, question_num, template.num_questions, this, false);
          break;
        }

        case 'Range': {
          new RangeAnswer2(question, template, question_num, template.num_questions, this, false);
          break;
        }
        case 'Text': {
          new TextPage(question, template, question_num, template.num_questions, this, false);
          break;
        }
      }
    }
  }

  getHeadingField() {
    let section = this;
    let parent_template = this.parent_template;

    return {
      tag: 'div',
      class: 'wrapper',
      children: [
        { tag: 'p', class: 'editFieldLabel', html: 'Heading' },
        {
          tag: 'textarea',
          class: 'questionHeading',
          rows: 1,
          html: this.label,
          keyup: function () {
            if (parent_template.update_timer !== null) clearTimeout(parent_template.update_timer);
            let value = $(this).val().trim();

            parent_template.update_timer = setTimeout(function () {
              section.label = value;
              $(section.view_question_DOM).find('.headingText').html(section.label);
              section.updateEmptyFields();
            }, 250);
          },
          input: function () {
            $(this).outerHeight(this.scrollHeight);
          },
        },
      ],
    };
  }

  getDeleteSectionForm() {
    $('#questionnaire-dropdown-section-menu').empty();
    for (let section of this.parent_template.sections) {
      $(section.dropdown_menu_item).appendTo($('#questionnaire-dropdown-section-menu')).show();
    }

    $(this.dropdown_menu_item).hide();

    //check for multiple sections
    if (this.parent_template.sections.length > 1 && this.questions.length) {
      $('#delete-section-form').find('.radioButton').last().removeClass('disabled');
      $('#delete-section-form').find('.wrapper').last().removeClass('disabled');
      let index = this.parent_template.section_index + 1;
      if (this.parent_template.section_index === this.parent_template.sections.length - 1)
        index = this.parent_template.section_index - 1;
      this.parent_template.section_to_move_to = this.parent_template.sections[index];
      $('#delete-section-form')
        .find('.projectMenuButtonText')
        .html('Section ' + (index + 1));
      $('.sectionItemActive').removeClass('sectionItemActive');
      $(this.parent_template.section_to_move_to.dropdown_menu_item).addClass('sectionItemActive');
    } else {
      $('#modal-secondary').fadeIn(300);
      $('#delete-empty-section-form')
        .find('#delete-empty-section-label')
        .html("Delete 'Section " + this.num + "'?");
      $('#delete-empty-section-form').fadeIn(300);
      return;

      // $("#delete-section-form").find(".radioButton").last().addClass("disabled");
      // $("#delete-section-form").find(".wrapper").last().addClass("disabled");
    }

    // $("#questionnaire-dropdown-section-menu").find(".projectMenuItem").show();
    $('#modal-secondary').fadeIn(300);
    $('#delete-section-form').find('.wrapper').last().prev().addClass('hidden');
    $('#delete-section-form').height('260px');
    $('#delete-section-form').find('.wrapper').first().css('padding-bottom', '10px');

    $('#delete-section-form').find('.radioButton').removeClass('radioButtonActive');
    $('#delete-section-form').find('.projectMenuButton, .buttonDeleteSection ').addClass('disabled');
    $('#delete-section-form')
      .find('#delete-section-label')
      .html("Delete 'Section " + this.num + "'?");
    $('#delete-section-form').fadeIn(300);
  }

  toggleGoToMenu(e, button) {
    let section = this;
    let parent_template = section.parent_template;

    if ($(e.target).hasClass('disabledClickable') || $(e.target).hasClass('goToDropDownMenu')) return;

    if (!Questionnaires.go_to_menu_open) {
      //only add scroll padding for non-Safari browsers

      let scroll_bar_class = Utils.isScrollBarVisible($('#questionnaire-view-template'))
        ? 'noScroll scrollBarPaddingRight'
        : 'noScroll';

      if ($.browser.win) $('#questionnaire-view-template').addClass(scroll_bar_class);

      section.parent_template.updateItemCount();

      $.each($('#select-goto-scroll-bar').find('.sectionScrollIcon'), function (index, value) {
        let order = index + 1;
        if (order <= section.parent_template.getCurrentSection().num) {
          // $(value).parent().addClass("disabled");
          $(value).parent().children().addClass('disabled');
        } else {
          $(value).parent().children().removeClass('disabled');
        }
      });

      $('#questionnaire-view-template').find('.goToMenuButton').removeClass('moveToFront');
      $(button).addClass('moveToFront');
      $('#questionnaire-modal').addClass('scrollBarMargin');
      $('#select-goto-scroll-bar').removeClass('hidden');

      let answer_index = $.inArray($(button)[0], $('#questionnaire-view-template').find('.goToMenuButton'));

      $('#question-scroll-bar').addClass('hidden');
      $('#questionnaire-viewer')
        .find('.modalMessage')
        .css('top', $(button).offset().top - 55);
      $('#questionnaire-modal, .modalMessage').fadeIn(300);
      $(button).find('.buttonDeleteGoTo').removeClass('hidden');
      $(button).find('.buttonDeleteGoTo').unbind();
      $(button)
        .find('.buttonDeleteGoTo')
        .click(function (e) {
          e.stopPropagation();

          if (!section.parent_template.delete_goto_form) {
            //delete questionnaire form
            section.parent_template.delete_goto_form = DOM.new({
              tag: 'div',
              class: 'deleteGoToForm',
              parent: Content.div,
              children: [
                {
                  tag: 'div',
                  class: 'containerBottomBar hideScrollBar',
                  style: 'overflow-y: visible',
                  children: [
                    { tag: 'p', class: 'formTitle', html: 'Delete Go To?' },
                    {
                      tag: 'div',
                      class: 'wrapperNoPad centerText',
                      children: [{ tag: 'p', class: 'formText inline' }],
                    },
                    {
                      tag: 'div',
                      class: 'questionReorderControlBar',
                      children: [
                        {
                          tag: 'button',
                          label: 'Cancel',
                          class: 'buttonCancelForm',
                          up_action: function (e) {
                            e.stopPropagation();
                            $('#modal-secondary').fadeOut(300);
                            $(section.parent_template.delete_goto_form).fadeOut(300);
                          },
                        },
                        { tag: 'button', label: 'Delete Go To', class: 'buttonDeleteSection' },
                      ],
                    },
                  ],
                },
              ],
            });
          }

          $(section.parent_template.delete_goto_form).fadeIn(300);
          $('#modal-secondary').fadeIn(300);

          //add label
          $(section.parent_template.delete_goto_form)
            .find('p.formText')
            .html('Delete the go to question for <b> Section ' + section.num + '</b>?');

          //bind delete action for specific answer
          $(section.parent_template.delete_goto_form)
            .find('.buttonDeleteSection')
            .click(function () {
              section.go_to = null;
              section.metadata.go_to = null;

              $(button).find('p.menuButtonLabel').html('Next Section');
              $(button).parent().removeClass('redText');
              $(section.scroll_icon).removeClass('questionError');
              $(section.scroll_icon).find('img').attr('src', section.scroll_icon_src);
              $(section.view_question_DOM).find('p.goto-label').html('Upon leaving section go to next section');

              $(section.parent_template.delete_goto_form).fadeOut(300);
              $('#modal-secondary').fadeOut(300);
              section.parent_template.save();
            });
        });

      //bind select scroll bar to specific question
      $('#select-goto-scroll-bar').find('.questionScrollIcon, .sectionScrollIcon').unbind();

      //question scroll icons
      $('#select-goto-scroll-bar')
        .find('.questionScrollIcon')
        .click(function (e) {
          if (!$(e.target).hasClass('disabled')) {
            let num = $(this).children('p').html().replace('S', '').replace('Q', '');

            let question = section.parent_template.question_map[num];
            if (question) {
              section.go_to = question.id;
              section.metadata.go_to = question.id;
            }

            $(button)
              .find('p.menuButtonLabel')
              .html('Q' + question.template_question_num);
            $(section.view_question_DOM)
              .find('p.goto-label')
              .html('Upon leaving section go to Q' + question.template_question_num);
            $(question.scroll_icon).removeClass('questionError');
            $(button).parent().removeClass('redText');
            section.parent_template.save();

            // section.updateEmptyFields();
          }
        });

      //section scroll icons
      $('#select-goto-scroll-bar')
        .find('.sectionScrollIcon')
        .click(function () {
          if (!$(e.target).hasClass('disabled')) {
            let num = $(this).html().replace('S', '').replace('Q', '');
            let selected_section = section.parent_template.sections[num - 1];
            section.go_to = selected_section.id;
            section.metadata.go_to = selected_section.id;

            $(button)
              .find('p.menuButtonLabel')
              .html('S' + num);
            $(section.view_question_DOM)
              .find('p.goto-label')
              .html('Upon leaving section go to S' + num);

            $(button).parent().removeClass('redText');
            $(section.scroll_icon).removeClass('questionError');
            section.parent_template.save();

            // section.updateEmptyFields();
          }
        });

      //end section
      $('#select-goto-scroll-bar')
        .find('.endIcon')
        .click(function () {
          if (!$(e.target).hasClass('disabled')) {
            section.go_to = parent_template.end_uuid;
            section.metadata.go_to = parent_template.end_uuid;
            $(section.view_question_DOM).find('p.goto-label').html('Upon leaving section go to end of questionnaire');
            $(button).find('p.menuButtonLabel').html('End');
            $(button).parent().removeClass('redText');
            $(section.scroll_icon).removeClass('questionError');
            section.parent_template.save();
            // section.updateEmptyFields();
          }
        });

      if (!section.go_to) {
        $(button).find('.buttonDeleteGoTo').addClass('hidden');
        $(button).find('.buttonDropdown').removeClass('hidden');
      } else {
        $(button).find('.buttonDropdown').addClass('hidden');
        $(button).find('.buttonDeleteGoTo').removeClass('hidden');
      }

      Questionnaires.go_to_menu_open = true;
    } else {
      //close go to windows

      if ($.browser.win) $('#questionnaire-view-template').removeClass('noScroll scrollBarPaddingRight');

      setTimeout(function () {
        $('#questionnaire-view-template').find('.goToMenuButton').removeClass('moveToFront');
        $('#questionnaire-modal').removeClass('scrollBarMargin');
      }, 200);

      $('#select-goto-scroll-bar').addClass('hidden');
      $('#question-scroll-bar').removeClass('hidden');
      $(button).find('.buttonDeleteGoTo').addClass('hidden');

      $(button).find('.buttonDropdown').removeClass('hidden');
      $('#questionnaire-modal, .modalMessage').fadeOut(300);
      Questionnaires.go_to_menu_open = false;
    }
  }

  getPage() {
    let parent_template = this.parent_template;
    let section = this;

    parent_template.current_question_index = -1;
    parent_template.section_index = section.num - 1;
    parent_template.changeQuestion();

    // $("#questionnaire-view-template").find(".questionWrapper").remove();
    $('#button-add-question, #button-reorder-questions').removeClass('disabled');
    // $(".questionScrollIcon, .headerScrollIcon, .sectionScrollIcon, .iconActive").removeClass("iconActive");
    $(this).addClass('iconActive');

    //
    // $("#questionnaire-view-template").children().not(".newQuestionModalForm").remove();
    // let section_view = (parent_template.edit_mode) ? $(section.edit_question_DOM): $(section.view_question_DOM);
    // $(section_view).appendTo($("#questionnaire-view-template"));
    // $(".sectionScrollIconActive").removeClass("sectionScrollIconActive");
    // $(section.scroll_icon).addClass("sectionScrollIconActive");
  }

  updateEmptyFields() {
    //add error styling to any question with missing labels
    //relevant missing text fields gets red border
    //question scroll icon gets red icon and text

    let section = this;

    // question.updateError(false);
    //
    // if (question.instructions) {
    //     $(question.edit_question_DOM).find("textarea.instructionField").outerHeight(42);
    //     $(question.edit_question_DOM).find("textarea.instructionField").outerHeight($(question.edit_question_DOM).find("textarea.instructionField").prop("scrollHeight"));
    // } else {
    //     $(question.edit_question_DOM).find("textarea.instructionField").outerHeight(42);
    // }

    //check for property because sub questions don't have a heading
    $(section.edit_question_DOM).find('textarea.questionHeading').outerHeight(42);
    if (section.label)
      $(section.edit_question_DOM)
        .find('textarea.questionHeading')
        .outerHeight($(section.edit_question_DOM).find('textarea.questionHeading').prop('scrollHeight'));
    section.parent_template.save();
  }

  updateError(error_bool) {
    //adds red error styling to question
    //call this when question is missing critical fields
    //critical fields are the question label, and question options

    //if method is called by a sub_question, set error styling on parent question;

    let section = this;

    if (error_bool) {
      $(section.scroll_icon).children('.sectionScrollIcon').addClass('questionError');
      $(section.reorder_list_item).addClass('questionError');
      $(section.view_question_DOM).find('p.goto-label').addClass('redText');
      $(section.edit_question_DOM).find('.goToContainer').addClass('redText');
    } else {
      $(section.scroll_icon).children('.sectionScrollIcon').removeClass('questionError');
      $(section.reorder_list_item).removeClass('questionError');
      $(section.view_question_DOM).find('p.goto-label').removeClass('redText');
      $(section.edit_question_DOM).find('.goToContainer').removeClass('redText');
    }

    this.parent_template.save();
  }

  getAssetViewerSectionView() {
    return {
      tag: 'div',
      class: 'questionWrapper section-wrapper',
      children: [
        { tag: 'p', class: 'questionNumber', html: 'S' + this.num },
        { tag: 'p', class: 'questionType', html: 'Section' },
        { tag: 'p', class: 'headingText', html: this.label },
        { tag: 'div', class: 'wrapper-flex align-right', children: [{ tag: 'p', class: 'goto-label' }] },
      ],
    };
  }
}
class Question {
  constructor(metadata, parent_template, question_num, template_question_num, section, is_new, parent_question, answer_index) {
    // if parent question is passed in, question is a sub question of parent_question

    for (let property in metadata) this[property] = metadata[property];
    this.answer_index = answer_index;
    this.metadata = metadata;
    this.parent_template = parent_template;
    this.section = section;
    this.question_num = question_num;
    this.template_question_num = template_question_num;
    this.metadata.num = this.template_question_num;
    let question = this;
    this.view_question_DOM = null;
    this.edit_question_DOM = null;
    this.scroll_label = 'Q' + this.template_question_num;

    this.asset_edit_view = null;
    this.asset_view_view = null;

    //add required property if it is missing
    if (!metadata.hasOwnProperty('required')) {
      this.required = Questionnaires.REQUIRED_DEFAULT;
      this.metadata.required = Questionnaires.REQUIRED_DEFAULT;
    }

    if (parent_template.constructor.name === 'Questionnaire') {
      if (section) section.questions.push(this);
      this.parent_template.question_map[this.template_question_num] = this;
      this.parent_template.question_id_map[this.id] = this;
      return;
    }

    //if sub question, don't create standard UI elements
    if (parent_question) {
      this.is_sub_question = true;
      $('.subQuestionModalForm').fadeOut();
      if (!this.id) {
        this.id = Utils.generateUUID();
        this.metadata.id = this.id;
        // this.parent_template.question_id_map[this.id] = this;
      }
      this.parent_template.question_id_map[this.id] = this;
      return;
    }

    question.getBranchIcon();
    question.getScrollIcon();

    $(this.scroll_icon).removeClass('iconActive');

    if (parent_template.current_question_index !== -1) ++parent_template.current_question_index;

    this.reorder_list_item = DOM.new({
      tag: 'div',
      class: 'reorderQuestionListItem clickable',
      parent: $($(section.reorder_list_item).children('.reorderSectionListItem').children('.wrapperNoPad')),

      mousedown: function (e) {
        if ($(e.target).hasClass('reorderQuestionListItem')) {
          $(this).addClass('originalQuestionPlaceholder');
          $(section.reorder_list_item).css('background-color', 'transparent');
        }
      },
      mouseup: function () {
        $.each($('.reorderQuestionListItem'), function (index, value) {
          $(value).css('background-color', 'transparent');
          $(value).css('opacity', '1');
        });

        $(section.reorder_list_item).css('background-color', 'transparent');
        $(this).removeClass('originalQuestionPlaceholder').css('background-color', 'transparent');

        $(parent_template.reorder_question_form).find('.indent').sortable('refreshPositions');
        // e.stopPropagation();

        parent_template.reorderItems();
      },
      children: [
        { tag: 'button', style: ['buttonMoveQuestionnaireItems', 'unclickable'], label: SVG.getMoveQuestionnaireItemsIcon() },
        { tag: 'img', class: 'scrollIconImg' },
        { tag: 'p', class: 'reorderQuestionText unclickable', html: 'Q' + question_num + ': ' + this.label },
      ],
    });

    // if (!this.label) $(this.scroll_icon).addClass("questionError");
    // this.updateEmptyFields();

    if (is_new) {
      if (parent_template.current_question_index === -1) {
        section.questions.unshift(this);
      } else {
        section.questions.splice(parent_template.current_question_index, 0, this);
      }
      this.id = Utils.generateUUID();
      this.metadata.id = this.id;
    } else {
      //add to section question list

      if (!this.id) this.id = Utils.generateUUID();
      section.questions.push(this);
      $(this.scroll_icon).appendTo($(section.scroll_icon));
      // //add to question map
      // this.parent_template[this.template_question_num] = this;
    }
    $(this.reorder_list_item).attr('id', 'question-' + question.id);

    //add to question map
    this.parent_template.question_map[this.template_question_num] = this;
    this.parent_template.question_id_map[this.id] = this;
    $('#questionnaire-view-template').scrollTop(0);
    if (is_new) $(question.scroll_icon).click();
  }

  //show question page in viewer
  getPage() {
    let question = this;
    $(this.scroll_icon).addClass('iconActive');
    $('.questionScrollIcon, .headerScrollIcon, .sectionScrollIcon, .sectionScrollContainer').removeClass('iconActive');
    $('.buttonReorderQuestion, .buttonAddQuestion').removeClass('disabled');

    let parent_template = this.parent_template;
    let section = this.section;

    parent_template.current_question_index = question.question_num - 1;
    parent_template.section_index = section.num - 1;
    parent_template.changeQuestion();

    $('.sectionScrollIconActive').removeClass('sectionScrollIconActive');
    $(section.scroll_icon).addClass('sectionScrollIconActive');

    $($('#select-goto-scroll-bar').find('.questionScrollIcon')[question.template_question_num - 1]).addClass('iconActive');

    question.setTextAreaWidth();

    //
    // let max_width = 0;
    //
    // $.each($(question.view_question_DOM).find(".questionOption"), function(index, value) {
    //     if ($(value).find("td p.questionnaireQuestion").width() > max_width) max_width = $(value).find("td p.questionnaireQuestion").width()
    // })
    //
    // $(question.view_question_DOM).find(".questionOption").children("td").children("p.questionnaireQuestion").css("width", max_width)
  }
  getScrollIcon() {
    let question = this;

    //question bar scroll icon
    this.scroll_icon = DOM.new({
      tag: 'div',
      class: 'questionScrollIcon',
      click: function () {
        question.getPage();
      },
      children: [
        { tag: 'p', class: 'scrollIconText', html: 'Q' + question.template_question_num },
        { tag: 'img', class: 'scrollIconImg' },
      ],
    });
  }
  makeEditable() {}
  setEditableAll() {}

  //fields
  getHeadingField() {
    let question = this;
    let parent_template = this.parent_template;

    return {
      tag: 'div',
      class: 'wrapper',
      children: [
        { tag: 'p', class: 'editFieldLabel', html: 'Heading' },
        {
          tag: 'textarea',
          class: 'questionHeading',
          rows: 1,
          html: this.heading,
          blur: function () {
            question.heading = $(this).val().trim();
            $(question.view_question_DOM).find('.headingText').html(question.heading);
            if (!question.heading) {
              $(question.view_question_DOM).find('p.headingText').addClass('hidden');
            } else {
              $(question.view_question_DOM).find('p.headingText').removeClass('hidden');
            }
            question.updateEmptyFields();
          },
          keyup: function () {
            if (parent_template.update_timer !== null) {
              let input = $(this);
              clearTimeout(parent_template.update_timer);
              parent_template.update_timer = setTimeout(function () {
                question.heading = $(input).val().trim();
                $(question.view_question_DOM).find('.headingText').html(question.heading);

                if (!question.heading) {
                  $(question.view_question_DOM).find('p.headingText').addClass('hidden');
                } else {
                  $(question.view_question_DOM).find('p.headingText').removeClass('hidden');
                }
                question.updateEmptyFields();
              }, 200);
            }
          },
          input: function () {
            $(this).outerHeight(this.scrollHeight);
          },
        },
      ],
    };
  }

  getQuestionField() {
    let question = this;
    let parent_template = this.parent_template;

    let variable_name = question.value ? question.value : question.label ? Utils.formatVariableName(question.label) : '';

    let label = this.is_sub_question ? 'Sub Question' : 'Question';

    let is_decline = this.answer_index === -1;

    function blur() {
      // question.label = $(this).val().trim();
      // $($(question.view_question_DOM).children(".questionText")[0]).html(question.label.trim());
      // question.updateEmptyFields();
    }

    return {
      tag: 'div',
      class: 'wrapper',
      children: [
        { tag: 'p', class: 'editFieldLabel questionLabelField', html: label },
        {
          tag: 'textarea',
          class: 'questionField',
          rows: 1,
          html: question.label,
          keyup: function (e) {
            let code = e.keyCode || e.which;
            if (code === 9) {
              e.preventDefault();
              return;
            }

            if (parent_template.update_timer !== null) clearTimeout(parent_template.update_timer);
            let value = $(this).val().trim();

            parent_template.update_timer = setTimeout(function () {
              question.label = value;
              question.value = Utils.formatVariableName(label);

              $($(question.view_question_DOM).children('.questionText')[0]).html(question.label.trim());
              if (value) $($(question.view_question_DOM).children('.questionText')[0]).removeClass('redText');

              $(question.reorder_list_item)
                .children('.reorderQuestionText')
                .html('Q' + question.question_num + ': ' + question.label);
              $($(question.edit_question_DOM).find('.questionValueField')[0]).val(Utils.formatVariableName(question.label));

              if (question.is_sub_question) {
                //standard sub question
                if (question.answer_index > -1) {
                  if (question.parent_question.options[question.answer_index].sub_question)
                    question.parent_question.options[question.answer_index].sub_question.label = question.label;
                  //decline sub question
                } else if (question.answer_index === -1) {
                  if (question.parent_question.decline.sub_question)
                    question.parent_question.decline.sub_question.label = question.label;
                }

                // question.parent_question.options[question.answer_index].sub_question.label = question.label;
                question.parent_question.inspectErrors();
              } else {
                question.inspectErrors();
              }
            }, 100);
          },
          input: function () {
            $(this).outerHeight(this.scrollHeight);
          },
        },
        {
          tag: 'div',
          class: 'questionValueWrapper',
          children: [
            {
              tag: 'input',
              class: 'questionValueField',
              value: variable_name,
              keydown: function (e) {
                // if (!Utils.charWhitelist.includes(e.which) || e.shiftKey) e.preventDefault();
              },
              keyup: function () {
                let input = $(this);
                if (parent_template.update_timer !== null) clearTimeout(parent_template.update_timer);
                let value = $(input).val().trim();
                clearTimeout(parent_template.update_timer);
                parent_template.update_timer = setTimeout(function () {
                  question.value = Utils.formatVariableName(value);
                  question.metadata.value = question.value;
                  $(input).val(question.value);
                  if (question.is_sub_question) {
                    question.parent_question.options[question.answer_index].sub_question.value = question.value;
                    question.parent_question.inspectErrors();
                  } else {
                    question.inspectErrors();
                  }
                }, 1000);
              },
            },
          ],
        },
      ],
    };
  }

  getInstructionField(index) {
    let question_index = index !== undefined ? index : 0;
    let question_DOM = this;
    let question = question_index !== 0 ? this.questions[index] : this;
    let parent_template = this.parent_template;

    if (question.instructions) {
      $($(question_DOM.view_question_DOM).find('p.instructionText')[question_index]).removeClass('hidden');
    } else {
      if (question.instructions === null || question.instructions === '' || question.instructions === undefined) {
        $($(question_DOM.view_question_DOM).find('p.instructionText')[question_index]).addClass('hidden');
      }
    }

    // if (question.instructions === null || question.instructions === "" || question.instructions === undefined) {
    //
    //     console.log("NO instructions");
    //     console.log(question.instructions)
    //     $($(question_DOM.view_question_DOM).find("p.instructionText")[question_index]).addClass("hidden");
    //
    // } else {
    //
    //     $($(question_DOM.view_question_DOM).find("p.instructionText")[question_index]).removeClass("hidden");
    //     console.log("instructions");
    //     console.log(question.instructions)
    //
    // }

    return {
      tag: 'div',
      class: 'wrapper bottom-padding-large',
      children: [
        { tag: 'p', class: 'editFieldLabel', html: 'Instructions' },
        {
          tag: 'textarea',
          class: 'instructionField',
          rows: 1,
          html: question.instructions,
          blur: function () {
            question.instructions = $(this).val().trim();
            if (question.hasOwnProperty('metadata')) question.metadata.instructions = $(this).val().trim();

            $($(question_DOM.view_question_DOM).find('p.instructionText')[question_index]).html(question.instructions);
            if (!question.instructions) {
              $($(question_DOM.view_question_DOM).find('p.instructionText')[question_index]).addClass('hidden');
            } else {
              $($(question_DOM.view_question_DOM).find('p.instructionText')[question_index]).removeClass('hidden');
            }
            parent_template.save();
          },
          keyup: function () {
            if (parent_template.update_timer !== null) {
              let input = $(this);
              clearTimeout(parent_template.update_timer);
              parent_template.update_timer = setTimeout(function () {
                question.instructions = $(input).val().trim();
                if (question.hasOwnProperty('metadata')) question.metadata.instructions = $(input).val().trim();
                $($(question_DOM.view_question_DOM).find('p.instructionText')[question_index]).html(question.instructions);

                if (!question.instructions) {
                  $($(question_DOM.view_question_DOM).find('p.instructionText')[question_index]).addClass('hidden');
                } else {
                  $($(question_DOM.view_question_DOM).find('p.instructionText')[question_index]).removeClass('hidden');
                }
                parent_template.save();
              }, 200);
            }
          },
          input: function () {
            $(this).outerHeight(this.scrollHeight);
          },
        },
      ],
    };
  }
  getSubQuestionField() {
    let question = this;
    let parent_template = this.parent_template;

    let variable_name = question.label.replace(new RegExp(' ', 'g'), '_').substring(0, 30);

    return {
      tag: 'div',
      class: 'wrapper',
      children: [
        { tag: 'p', class: 'editFieldLabel', html: 'Sub Question' },
        {
          tag: 'textarea',
          class: 'shortAnswer',
          html: this.label,
          blur: function () {
            question.label = $(this).val().trim();
            $(question.view_question_DOM).children('.questionText').html(question.label.trim());
            question.updateEmptyFields();
          },
          keyup: function () {
            if (parent_template.update_timer !== null) {
              let value = $(this).val().trim();
              clearTimeout(parent_template.update_timer);
              parent_template.update_timer = setTimeout(function () {
                question.label = value;
                $(question.view_question_DOM).children('.questionText').html(question.label.trim());
                $(question.reorder_list_item)
                  .children('.reorderQuestionText')
                  .html('Q' + question.question_num + ': ' + question.label);
                question.updateEmptyFields();
              }, 450);
            }
          },
        },
        {
          tag: 'div',
          class: 'wrapperNoPad alignLeft',
          children: [{ tag: 'input', class: 'questionValueField', value: variable_name }],
        },
      ],
    };
  }

  getRequiredSelector() {
    let question = this;
    let template = this.parent_template;

    let true_class = 'radioButtonQuestionnaireSmall';
    let false_class = 'radioButtonQuestionnaireSmall';

    if (!question.required) {
      false_class += ' radioButtonActive';
    } else {
      true_class += ' radioButtonActive';
    }

    return {
      tag: 'div',
      class: 'optionsWrapper',
      children: [
        { tag: 'p', class: 'editFieldLabel inline boldText', html: 'Required' },
        {
          tag: 'div',
          class: 'inlineContainer clickable',
          children: [
            { tag: 'button', class: true_class },
            { tag: 'p', class: 'editFieldLabel inline', html: 'True' },
          ],
          click: function () {
            $(this).parent().find('.radioButtonActive').removeClass('radioButtonActive');
            $(this).find('.radioButtonQuestionnaireSmall').addClass('radioButtonActive');
            $(this).addClass('unclickable').removeClass('clickable');
            $(this).next().removeClass('unclickable').addClass('clickable');
            $(question.view_question_DOM).find('.optionsWrapper').removeClass('hidden');
            question.required = true;
            template.save();
          },
        },

        //single page
        {
          tag: 'div',
          class: 'inlineContainer clickable',
          children: [
            { tag: 'button', class: false_class },
            { tag: 'p', class: 'editFieldLabel inline', html: 'False' },
          ],
          click: function () {
            question.required = false;
            $(question.view_question_DOM).find('.optionsWrapper').addClass('hidden');
            $(this).parent().find('.radioButtonActive').removeClass('radioButtonActive');
            $(this).find('.radioButtonQuestionnaireSmall').addClass('radioButtonActive');
            $(this).addClass('unclickable').removeClass('clickable');
            $(this).prev().removeClass('unclickable').addClass('clickable');
            template.save();
          },
        },
      ],
    };
  }

  updateEmptyFields() {
    //add error styling to any question with missing labels
    //relevant missing text fields gets red border
    //question scroll icon gets red icon and text

    let question = this.is_sub_question ? this.parent_question : this;

    // question.updateError(false);

    if (question.instructions) {
      $(question.edit_question_DOM).find('textarea.instructionField').outerHeight(42);
      $(question.edit_question_DOM)
        .find('textarea.instructionField')
        .outerHeight($(question.edit_question_DOM).find('textarea.instructionField').prop('scrollHeight'));
    } else {
      $(question.edit_question_DOM).find('textarea.instructionField').outerHeight(42);
    }

    //check for property because sub questions don't have a heading
    if (question.hasOwnProperty('heading')) {
      if (question.heading) {
        $(question.edit_question_DOM).find('textarea.questionHeading').outerHeight(42);
        $(question.edit_question_DOM)
          .find('textarea.questionHeading')
          .outerHeight($(question.edit_question_DOM).find('textarea.questionHeading').prop('scrollHeight'));

        if (this.constructor.name === 'TextPage') {
          $(question.scroll_icon).removeClass('questionError');
          $(question.edit_question_DOM).removeClass('questionError');
          $(question.view_question_DOM).children('.headingText').removeClass('redText');
          $(question.reorder_list_item).find('img').attr('src', question.scroll_icon_src);
          $(question.scroll_icon).find('img').attr('src', question.scroll_icon_src);
          question.parent_template.save();
          return;
        }
      } else {
        $(question.edit_question_DOM).find('textarea.questionHeading').outerHeight(42);

        //only text page shows error if heading is missing
        if (this.constructor.name === 'TextPage') {
          $(question.scroll_icon).addClass('questionError');
          $(question.edit_question_DOM).addClass('questionError');
          $(question.view_question_DOM).children('.headingText').addClass('redText');
          $(question.reorder_list_item).find('img').attr('src', question.scroll_icon_error_src);
          $(question.scroll_icon).find('img').attr('src', question.scroll_icon_error_src);
          question.parent_template.save();
          return;
        }
      }
    }

    //update empty question labels
    if (question.label) {
      $(question.edit_question_DOM).find('textarea.questionField').outerHeight(42);
      $(question.edit_question_DOM)
        .find('textarea.questionField')
        .outerHeight($(question.edit_question_DOM).find('textarea.questionField').prop('scrollHeight'));

      if (question.label.trim() === '') {
        $(question.scroll_icon).addClass('questionError');
        $(question.reorder_list_item).addClass('questionError');
        $(question.reorder_list_item).find('img').attr('src', question.scroll_icon_error_src);
        $(question.scroll_icon).find('img').attr('src', question.scroll_icon_error_src);
        $(question.edit_question_DOM).addClass('questionError');
        $(question.view_question_DOM).children('.questionText').addClass('redText');
        $(question.view_question_DOM).children('.questionText').html(Questionnaires.NO_QUESTION_TEXT);
      } else {
        $(question.reorder_list_item).find('img').attr('src', question.scroll_icon_src);
        $(question.scroll_icon).find('img').attr('src', question.scroll_icon_src);
        $(question.edit_question_DOM).removeClass('questionError');
        $(question.scroll_icon).removeClass('questionError');
        $(question.reorder_list_item).removeClass('questionError');
      }
    } else {
      //
      // $(question.edit_question_DOM).find("textarea.questionField").outerHeight(42);
      //
      // $(question.reorder_list_item).addClass("questionError");
      // $(question.scroll_icon).addClass("questionError");
      // $(question.edit_question_DOM).addClass("questionError");
      // $(question.reorder_list_item).find("img").attr("src", question.scroll_icon_error_src);
      // $(question.scroll_icon).find("img").attr("src", question.scroll_icon_error_src);
      // $(question.view_question_DOM).children(".questionText").addClass("redText");
      // $(question.view_question_DOM).children(".questionText").html(Questionnaires.NO_QUESTION_TEXT);
    }

    // $($(question.edit_question_DOM).find(".questionVariableName")[0]).val(Utils.formatVariableName(question.label));

    //update empty answer options
    // if (this.constructor.name === "SingleAnswer2" || this.constructor.name === "MultiAnswer2" || this.constructor.name === "YesNo2") {
    //     question.setOptionFieldsHeight();
    // }

    // question.setTextAreaHeight();
    //
    // //update empty answer options
    // if (this.constructor.name === "SingleAnswer2" || this.constructor.name === "MultiAnswer2" || this.constructor.name === "Matrix") {
    //
    //     if (question.hasEmptyValues()) {
    //         $(question.scroll_icon).addClass("questionError");
    //         $(question.reorder_list_item).addClass("questionError");
    //         $(question.reorder_list_item).find("img").attr("src", question.scroll_icon_error_src);
    //         $(question.scroll_icon).find("img").attr("src", question.scroll_icon_error_src);
    //     }
    // }

    // if (question.is_sub_question) {
    //     question.parent_question.parent_template.save();
    //
    // } else {
    //     question.parent_template.save();
    //
    // }

    question.parent_template.save();
  }
  inspectErrors() {
    //inspect fields
    let error = this.inspectTextErrors();
    if (this.is_sub_question) {
      this.parent_question.save();
      return error;
    }
    this.updateError(error);
  }
  inspectTextErrors() {
    let error = false;
    let question = this;

    let question_label = $(question.edit_question_DOM).children('.wrapper').children('.questionField');

    if (!question_label.val()) {
      $(question_label).addClass('questionError');
      $(question.view_question_DOM).children('p.questionText').html(Questionnaires.NO_QUESTION_TEXT).addClass('redText');
      error = true;
    } else {
      $(question.view_question_DOM).children('p.questionText').removeClass('redText');
      $(question_label).removeClass('questionError');
    }

    question.updateEmptyFields();

    return error;
  }
  updateError(error) {
    //adds red error styling to question
    //call this when question is missing critical fields
    //critical fields are the question label, and question options

    //if method is called by a sub_question, set error styling on parent question;
    let question = this.is_sub_question ? this.parent_question : this;

    if (error) {
      question.setErrorStyle();
      if (!question.parent_template.errors) question.parent_template.errors = [];
      if (!question.parent_template.errors.includes(question.id)) question.parent_template.errors.push(question.id);
    } else {
      if (question.parent_template.errors) {
        if (question.parent_template.errors.includes(question.id))
          question.parent_template.errors.splice(question.parent_template.errors.indexOf(question.id), 1);
      }

      $(question.scroll_icon).removeClass('questionError');
      $(question.reorder_list_item).removeClass('questionError');
      $(question.reorder_list_item).find('img').attr('src', question.scroll_icon_src);
      $(question.scroll_icon).find('img').attr('src', question.scroll_icon_src);
    }

    this.parent_template.save();
  }

  getDeleteQuestionForm() {
    $('#modal-secondary').fadeIn(300);
    $('#delete-question-form')
      .find('#delete-question-label')
      .html("Delete 'Question " + this.question_num + "'?");
    $('#delete-question-form').fadeIn(300);
  }
  addDeclineOptionRow() {
    let question = this;
    let parent_template = this.parent_template;

    return {
      tag: 'div',
      class: 'wrapper noSidePad alignLeft',
      children: [
        {
          tag: 'div',
          class: 'declineOptionWrapper',
          children: [
            { tag: 'button', label: SVG.getBlackPlusSign(), style: ['buttonAddAnswer'] },
            { tag: 'p', class: 'answerLabel', html: 'Add Decline Option' },
            { tag: 'p', class: 'editFieldLabel hidden', html: 'Decline Option' },
            {
              tag: 'input',
              class: 'declineButtonInput hidden',
              value: 'Prefer not to answer',
              click: function (e) {
                e.stopPropagation();
              },
              blur: function () {
                question.decline.label = $(this).val().trim();
                question.metadata.decline.label = question.decline.label;
                $(question.view_question_DOM).find('.buttonDecline').html(question.decline.label);
                parent_template.save();
              },
              keyup: function () {
                if (parent_template.update_timer !== null) {
                  clearTimeout(parent_template.update_timer);
                  let input = $(this);
                  parent_template.update_timer = setTimeout(function () {
                    question.decline.label = $(input).val().trim();
                    question.metadata.decline.label = question.decline.label;
                    $(question.view_question_DOM).find('.buttonDecline').html(question.decline.label);
                    parent_template.save();
                  }, 450);
                }
              },
            },
          ],
          click: function () {
            if (question.decline) {
              question.decline = null;
              question.metadata.decline = null;

              $($(question.edit_question_DOM).find('.declineButtonInput')[0]).addClass('hidden');
              $($(question.edit_question_DOM).find('.declineOptionWrapper')[0])
                .children('p.editFieldLabel')
                .addClass('hidden');
              $($(question.edit_question_DOM).find('.declineOptionWrapper')[0])
                .children('.buttonAddAnswer')
                .html(SVG.getBlackPlusSign());
              $($(question.edit_question_DOM).find('.declineOptionWrapper')[0])
                .children('p.answerLabel')
                .html('Add Decline Option');
              $($(question.edit_question_DOM).find('.declineOptionWrapper')[0])
                .children('p.answerLabel')
                .removeClass('hidden');
              $($(question.edit_question_DOM).find('.declineOptionWrapper')[0]).removeClass('unclickable');

              //decline with always be last option
              $($(question.view_question_DOM).find('.buttonDecline')[0]).addClass('hidden');
              question.parent_template.save();
            } else {
              question.addDeclineOption();
            }
          },
        },
      ],
    };
  }
  addDeclineOption() {
    let question = this;
    let parent_template = this.parent_template;

    // if (!question.decline) {
    //     question.decline = {label: "Prefer not to answer"};
    // } else {
    //     if (!question.decline.label) question.decline = {label: "Prefer not to answer"};
    // }
    //
    // question.metadata.decline = question.decline;
    //
    // $(question.edit_question_DOM).find(".declineButtonInput").val(question.decline.label);
    // $(question.view_question_DOM).find(".buttonDecline").html(question.decline.label);
    //
    // $(question.edit_question_DOM).find(".declineButtonInput").removeClass("hidden");
    // $(question.view_question_DOM).find(".buttonDecline").removeClass("hidden");
    //
    // $(question.edit_question_DOM).find(".declineOptionWrapper").children(".buttonAddAnswer").html(SVG.getBlackMinusSign())
    // $(question.edit_question_DOM).find(".declineOptionWrapper").addClass("unclickable");
    //
    //
    // $(question.edit_question_DOM).find(".declineOptionWrapper").children(".answerLabel").addClass("hidden");
    // $(question.edit_question_DOM).find(".declineOptionWrapper").children("p.editFieldLabel").removeClass("hidden");
    //
    // question.parent_template.save();

    if (!question.decline) {
      question.decline = { label: 'Prefer not to answer' };
    } else {
      if (!question.decline.label) question.decline = { label: 'Prefer not to answer' };
    }

    question.metadata.decline = question.decline;

    $($(question.edit_question_DOM).find('.declineButtonInput')[0]).val(question.decline.label);
    $($(question.view_question_DOM).find('.buttonDecline')[0]).html(question.decline.label);

    $($(question.edit_question_DOM).find('.declineButtonInput')[0]).removeClass('hidden');
    $($(question.view_question_DOM).find('.buttonDecline')[0]).removeClass('hidden');

    $($(question.edit_question_DOM).find('.declineOptionWrapper')[0]).children('.buttonAddAnswer').html(SVG.getBlackMinusSign());
    $($(question.edit_question_DOM).find('.declineOptionWrapper')[0]).addClass('unclickable');

    $($(question.edit_question_DOM).find('.declineOptionWrapper')[0]).children('.answerLabel').addClass('hidden');
    $($(question.edit_question_DOM).find('.declineOptionWrapper')[0]).children('p.editFieldLabel').removeClass('hidden');

    question.parent_template.save();
  }
  setTextAreaHeight() {
    let question = this;
    $.each($(question.edit_question_DOM).find('textarea'), function (index, value) {
      $(value).outerHeight(42);
      $(value).outerHeight($(value).prop('scrollHeight'));
    });
  }
  setTextAreaWidth() {
    let question = this;

    let max_width = 0;

    $.each($(question.view_question_DOM).find('.questionOption'), function (index, value) {
      if ($(value).find('td p.questionnaireQuestion').width() > max_width)
        max_width = $(value).find('td p.questionnaireQuestion').width();
    });

    if (max_width) {
      $(question.view_question_DOM)
        .find('.questionOption')
        .children('td')
        .children('p.questionnaireQuestion')
        .css('width', max_width);
    } else {
      $(question.view_question_DOM).find('.questionOption').children('td').children('p.questionnaireQuestion').css('width', 'auto');
    }
  }
  setErrorStyle() {
    let question = this;
    setTimeout(function () {
      $(question.scroll_icon).addClass('questionError');
      $(question.reorder_list_item).addClass('questionError');
      $(question.reorder_list_item).find('img').attr('src', question.scroll_icon_error_src);
      $(question.scroll_icon).find('img').attr('src', question.scroll_icon_error_src);
    }, 5);
  }

  //question flow
  getBranchIcon() {
    let question = this;
    let parent_template = question.parent_template;
    let container = $(question.parent_template.branching_form).find('.show-branching-container');

    question.branching_icon = DOM.new({
      tag: 'div',
      class: 'branch-node',
      children: [
        { tag: 'p', class: 'branch-node-label', html: this.scroll_label },
        { tag: 'img', class: 'branch-node-img' },
      ],
      click: function (e) {
        question.showQuestionFlowPanel(e);
      },
      mouseover: function (e) {
        question.showQuestionFlowPanel(e);
      },
      mouseleave: function () {
        if (!$(this).hasClass('branch-node-selected')) {
          $.each($(container).find('.branch-line'), function (index, value) {
            if ($(value).parent().attr('id')) {
              if ($(value).parent().attr('id').includes(question.id)) {
                $(value).removeClass('branch-selected');
                $(value).removeClass('branch-hover');
              }
            }
          });

          $(container).find('.branch-line').not('.branch-line.branch-selected').removeClass('branch-faded');
          $('.question-flow-info-panel').hide();
        }

        if (parent_template.question_flow_active_question) {
          if (question !== parent_template.question_flow_active_question) {
            parent_template.question_flow_active_question.showQuestionFlowPanel();

            $.each($(container).find('.branch-line'), function (index, value) {
              if ($(value).parent().attr('id')) {
                if ($(value).parent().attr('id').includes(parent_template.question_flow_active_question.id)) {
                  $(value).addClass('branch-selected');
                  $(value).removeClass('branch-hover');
                  $(value).removeClass('branch-faded');
                }
              }
            });
          }
        }
      },
    });
  }
  showQuestionFlowPanel(e) {
    //show branch tooltip and branches

    let question = this;
    let node_icon = question.branching_icon;
    let question_flow_info_panel = $(this.parent_template.branching_form).find('.question-flow-info-panel');
    let container = $(this.parent_template.branching_form).find('.show-branching-container');

    if ($(node_icon).hasClass('branch-node-selected')) {
      if (e) {
        if (e.type === 'click') {
          $(question_flow_info_panel).hide();
          $(node_icon).removeClass('branch-node-selected');
          return;
        }
      }
    }

    if (e) {
      e.stopPropagation();
      if (e.type === 'mouseover') if ($(node_icon).hasClass('branch-node-selected')) return;
      if (e.type === 'click') question.parent_template.question_flow_active_question = question;
    }

    //empty and show tooltip
    $(question_flow_info_panel).empty();

    $(question_flow_info_panel).show();
    $(this.parent_template.branching_form).find('.question-flow-info-panel p.tooltip-header-label').html(question.scroll_label);
    $(this.parent_template.branching_form)
      .find('.question-flow-info-panel')
      .find('.branch-tooltip-contents, p.tooltip-content-label, .branch-goto-tooltip-contents')
      .removeClass('hidden');
    $(this.parent_template.branching_form)
      .find('.question-flow-info-panel p.tooltip-content-label')
      .removeClass('hidden')
      .html(question.label);

    //clone view question dom and copy to question flow panel
    let question_view = $(question.view_question_DOM).clone();
    $(question_view).appendTo(question_flow_info_panel);

    //show and set width
    $('.question-flow-info-panel').show();
    let max_width = 0;
    $(question_flow_info_panel).find('p.questionnaireQuestion').width('auto');

    if (question.options) {
      for (let option of question.options) {
        let index = question.options.indexOf(option);
        let row = $(question_flow_info_panel).find('tr.questionOption')[index];
        if ($(row).find('p.questionnaireQuestion').width() > max_width) max_width = $(row).find('p.questionnaireQuestion').width();

        //add goto label
        if (question.parent_template.getItemById(option.go_to))
          $(row)
            .find('p.goto-label')
            .html('Go to ' + question.parent_template.getItemById(option.go_to).scroll_label);
      }
    }

    if (!max_width) {
      $(question_flow_info_panel).find('p.questionnaireQuestion').width('auto');
    } else {
      $(question_flow_info_panel).find('p.questionnaireQuestion').width(max_width);
    }

    //only add active icon on click, not hover
    if (e) {
      if (e.type === 'click') {
        let icon_class = $('.question-flow-info-panel.tooltip-collapsed').length ? 'i' : SVG.getGreyCloseOutIcon();

        $('.question-flow-info-panel  div.branch-tooltip-icon').html(icon_class);
        if ($(node_icon).hasClass('branch-node-selected')) {
          $(node_icon).removeClass('branch-node-selected');
        } else {
          $(container).find('.branch-node-selected').removeClass('branch-node-selected');
          $(node_icon).addClass('branch-node-selected');
        }
      } else if (e.type === 'mouseover') {
        $('.question-flow-info-panel  div.branch-tooltip-icon').html('i');
      }
    }

    //clear all branch selected lines
    //highlight all branch lines from question

    if (e) {
      if (e.type === 'click') {
        $('.branch-line').removeClass('branch-selected');
        $.each($(container).find('svg.branch-line'), function (index, value) {
          if ($(value).parent().attr('id')) {
            if ($(value).parent().attr('id').includes(question.id)) {
              $(value).addClass('branch-selected').removeClass('branch-faded').removeClass('branch-hover');
            }
          }
        });
      }

      if (e.type === 'mouseover') {
        $('.branch-line').removeClass('branch-selected').removeClass('branch-hover');
        $.each($(container).find('svg.branch-line'), function (index, value) {
          if ($(value).parent().attr('id')) {
            if ($(value).parent().attr('id').includes(question.id)) {
              $(value).addClass('branch-hover').removeClass('branch-faded');
            }
          }
        });
      }
    }

    $('.branch-line').not('.branch-line.branch-selected, .branch-line.branch-hover').addClass('branch-faded');
  }
  showBranchToolTip(e, option_index) {
    e.stopPropagation();

    let question = this;

    //question flow ui
    let container = $(this.parent_template.branching_form).find('.show-branching-container');
    let tooltip = $(this.parent_template.branching_form).find('.question-flow-tooltip');
    let tooltip_bottom_edge;
    let tooltip_left_edge;
    let scroll_top = $(container)[0].scrollTop;
    let question_flow_panel_bottom_edge =
      $('#questionnaire-' + question.parent_template.id + '-branching-form .questionReorderControlBar').offset().top - 10;
    let question_flow_panel_left_edge = $(
      '#questionnaire-' + question.parent_template.id + '-branching-form .questionReorderControlBar'
    ).offset().left;

    //option details
    let option = question.options[option_index];
    let option_go_to = question.parent_template.getItemById(option.go_to);

    //positioning
    let target = $(e.target).parent().parent();
    let x = $(e.target).parent().offset().left;
    let y = e.clientY - 150 + scroll_top;

    //clear and show tooltip
    $(tooltip).empty();
    $(tooltip).removeClass('hidden');

    //only show option for highlighted branch
    $(question.view_question_DOM).clone().appendTo($(tooltip));
    $(tooltip).find('.subQuestion').remove();

    let branch_option = $($('.question-flow-tooltip').find('tr.questionOption')[option_index]);
    $('.question-flow-tooltip').find('tr.questionOption, .optionsWrapper').remove();

    //update go to if empty

    // console.log(option_go_to)

    let tooltip_goto_target_label = option_go_to.type === 'Multi Text' ? option_go_to.questions[0].label : option_go_to.label;

    let goto_label = option_go_to
      ? "<b style='white-space:nowrap; margin-right: 10px'>" +
      option_go_to.scroll_label +
      '</b>' +
      ' ' +
      ' <span>' +
      tooltip_goto_target_label +
      '</span>'
      : '';
    // let goto_label = (option_go_to) ? "<b>" + option_go_to.scroll_label + "</b>" + ": "  + option_go_to.label : "";

    if (option_go_to.constructor.name === 'Section') goto_label = '<b>' + option_go_to.scroll_label + '</b>';
    let branch_label = branch_option ? branch_option.label : '';

    let item = DOM.new({
      tag: 'div',
      children: [
        { tag: 'div', children: [{ tag: 'p', class: 'questionnaireQuestion', html: option.label }] },
        { tag: 'div', children: [{ tag: 'p', class: 'goto-label', html: 'Go to' }] },
        { tag: 'div', children: [{ tag: 'p', class: 'questionnaireQuestion', html: goto_label }] },
      ],
    });

    $(item).appendTo($('.question-flow-tooltip .questionnaireOptions'));

    //align tooltip to either left or right or mouse position
    if ($(target).hasClass('branch-line-left')) x = $(e.target).parent().offset().left - $(tooltip).width() - 152;
    if ($(target).hasClass('branch-line-right')) x = $(e.target).parent().offset().left + $(e.target).parent().width() - 140;
    $(tooltip)
      .css('top', y + 'px')
      .css('left', x + 'px');

    //readjust if tooltip overlapping bottom control bar of panel
    tooltip_bottom_edge = $(tooltip).offset().top + $(tooltip).height();
    if (tooltip_bottom_edge > question_flow_panel_bottom_edge)
      y = question_flow_panel_bottom_edge - $(tooltip).height() + scroll_top - 150;

    //readjust if tooltip overlapping left edge of panel
    tooltip_left_edge = $(tooltip).offset().left;

    if (tooltip_left_edge < question_flow_panel_left_edge) {
      let offscreen_px = question_flow_panel_left_edge - tooltip_left_edge;
      let width = $(tooltip).width() - offscreen_px;
      $(tooltip).width(width);
    }

    $(tooltip)
      .css('top', y + 'px')
      .css('left', x + 'px');
  }

  //write and save
  toJSON() {
    let json = {};
    for (let property in this) {
      if (Object.keys(this.metadata).includes(property)) {
        json[property] = this[property];
      }
    }
    return json;
  }
  save() {
    if (this.is_sub_question) {
      this.parent_question.parent_template.save();
    } else {
      this.parent_template.save();
    }
  }

  getSubQuestionNumber() {
    //returns the sub question number to be displayed above sub questions in view/edit mode

    let sub_question_number = '';

    if (this.is_sub_question) {
      let parent_question = this.parent_question;
      let char = 'a';

      for (let i = 0; i < this.answer_index; i++) char = Utils.nextAlphabetChar(char);

      sub_question_number = 'Q' + parent_question.template_question_num + '-' + char.toUpperCase();
    }

    return sub_question_number;
  }

  // asset viewer responses
  drawEditableResponse() {
    this.asset_edit_view = $(this.view_question_DOM).clone();
    let question_num = this.is_sub_question ? this.getSubQuestionNumber() : 'Q' + this.template_question_num;
    if (!this.heading) $(this.asset_edit_view).find('p.headingText').remove();

    $(this.asset_edit_view).find('.questionNumber').first().html(question_num);
    $(this.asset_edit_view).find('.textFieldPlaceHolder').removeClass('textFieldPlaceHolder');
    // view.find(".questionType").remove();
  }
  drawViewResponse() {
    this.asset_view_view = $(this.view_question_DOM).clone();
    let question_num = this.is_sub_question ? this.getSubQuestionNumber() : 'Q' + this.template_question_num;
    this.asset_view_view.find('.questionNumber').first().html(question_num);
    this.asset_view_view.find('.textFieldPlaceHolder').removeClass('textFieldPlaceHolder');
    // $(this.asset_view_view).appendTo(container);
  }
  getResponse() {
    //response values for assets

    let response = '';

    if (this.responseStrings != null) {
      for (let string of this.responseStrings) if (string) response += this.responseStrings;
    }
    return response ? response : '';
  }
  getAssetViewerTableCell() {
    let question = this;
    let questionnaire = this.parent_template;

    function embedded_asset_element(uuid) {
      let asset = Assets.getAsset(uuid);

      let asset_label = asset.title != null ? asset.title : asset.type.toUpperCase();

      let filename = asset_label + '.' + asset.format.toLowerCase();

      return {
        tag: 'div',
        class: 'embeddedAssetRow',
        children: [
          { tag: 'img', class: 'embeddedAsset', src: asset.file_url },
          { tag: 'p', class: 'embeddedAssetCellLabel', html: "View '<b>" + filename + '</b>' },
        ],
        click: function () {
          questionnaire.getEmbeddedAssetViewer(question.id, uuid, 'questionnaire-viewer-container');
        },
        mouseover: function (e) {
          e.stopPropagation();
          e.stopImmediatePropagation();
          clearTimeout(questionnaire.questionnaire_asset_viewer.tooltip_timer);
          $(questionnaire.questionnaire_asset_viewer.tooltip).hide();
          $(this).parent().removeClass('tooltip-visible');
        },
        mouseleave: function () {
          $(this).removeClass('embedded-asset-selected');
        },
      };
    }

    function generate_question_cell(response, allow_embedded_assets) {
      let cell_children = [
        {
          tag: 'button',
          label: SVG.getPencilSmall(),
          style: ['buttonEditItems', 'button-edit-question'],
          up_action: function () {
            questionnaire.editCompletedQuestionnaire(question.id);
          },
        },
        { tag: 'div', children: [{ tag: 'p', html: response }] },
      ];

      // no embedded assets for sub questions at this time
      if (allow_embedded_assets) {
        if (question.hasOwnProperty('assetUuids')) {
          if (question.assetUuids.length) {
            for (let uuid of question.assetUuids) cell_children.push(embedded_asset_element(uuid));
          }
        }
      }
      return { tag: 'td', class: 'multi-text-cell', children: cell_children };
    }

    let cell = generate_question_cell(question.getResponse(Assets.viewerOptions.responses), true);

    questionnaire.table_cells.push(cell);

    // questionnaire.table_cells.push(
    //     {tag: "td", class: "multi-text-cell", children: [
    //             {tag: "button", label: SVG.getPencilSmall(), style: ["buttonEditItems", "button-edit-question"], up_action: function () {
    //                     questionnaire.editCompletedQuestionnaire(question.id);
    //                 }
    //             },
    //             {tag: "div", children: [
    //                     {tag: "p", html: question.getResponse()}
    //                 ]},
    //         ]})
  }
}

//standard question types
class SingleAnswer2 extends Question {
  constructor(metadata, parent_template, question_num, template_question_num, section, is_new, parent_question, answer_index) {
    super(metadata, parent_template, question_num, template_question_num, section, is_new, parent_question, answer_index);

    this.scroll_icon_src = 'lib/images/icons/icon-single_select-46x46.png';
    this.scroll_icon_error_src = 'lib/images/icons/icon-single_select-error-46x46.png';
    $(this.scroll_icon).find('img').attr('src', this.scroll_icon_src);
    $(this.reorder_list_item).find('img').attr('src', this.scroll_icon_src);

    let single_answer = this;
    single_answer.is_sub_question = false;

    single_answer.view_question_DOM = null;
    single_answer.edit_question_DOM = null;

    let view_mode_fields = [];
    let edit_mode_control_options = [];
    let edit_mode_option_fields = [];

    //answer option fields
    for (let j = 0; j < this.options.length; j++) {
      view_mode_fields.push({
        tag: 'tr',
        class: 'questionOption',
        children: [
          {
            tag: 'td',
            children: [{ tag: 'div', class: 'questionOptionShape' }],
          },
          {
            tag: 'td',
            children: [{ tag: 'p', class: 'questionnaireQuestion', html: this.options[j].label }],
          },
          {
            tag: 'td',
            children: [{ tag: 'p', class: 'goto-label' }],
          },
        ],
      });

      edit_mode_option_fields.push(single_answer.createOptionField(j));
    }
    // let edit_fields_container = DOM.new({tag: "div", class: "container question-edit-field-container", children: edit_answer_fields})

    edit_mode_control_options.push({ tag: 'div', class: 'question-edit-field-container', children: edit_mode_option_fields });

    edit_mode_control_options.push(single_answer.addOptionRow());
    edit_mode_control_options.push(single_answer.addDeclineOptionRow());
    edit_mode_control_options.push({
      tag: 'div',
      class: 'wrapperNoPad',
      children: [
        {
          tag: 'button',
          class: 'buttonDeleteQuestion',
          label: 'Delete Question',
          up_action: function () {
            single_answer.getDeleteQuestionForm();
          },
        },
      ],
    });

    let instruction_class = 'instructionText';
    if (this.instructions === null) instruction_class += ' hidden';
    let required_class = 'optionsWrapper';
    if (!this.required) required_class += ' hidden';

    this.view_question_DOM = DOM.new({
      tag: 'div',
      class: 'questionWrapper question-view-mode',
      children: [
        { tag: 'p', class: 'questionNumber', html: 'Q' + template_question_num },
        {
          tag: 'div',
          class: required_class,
          children: [{ tag: 'p', class: 'editFieldLabel inline boldText redText', html: 'Required' }],
        },
        { tag: 'p', class: 'questionType', html: this.type },
        { tag: 'p', class: 'headingText', html: this.heading },
        { tag: 'p', class: 'questionText', html: this.label },
        { tag: 'p', class: instruction_class, html: this.instructions },
        {
          tag: 'div',
          class: 'dropDownViewModeContainer',
          children: [
            {
              tag: 'div',
              class: 'questionnairePlaceholder hidden',
              children: [{ tag: 'div', class: 'buttonQuestionnaireDropDown' }],
            },
            { tag: 'div', class: 'questionnaireOptions alignLeft', children: view_mode_fields },
          ],
        },
      ],
    });

    edit_mode_control_options.unshift(single_answer.getModeSelector());
    edit_mode_control_options.unshift(single_answer.getInstructionField());
    edit_mode_control_options.unshift(single_answer.getQuestionField());
    edit_mode_control_options.unshift(single_answer.getHeadingField());
    edit_mode_control_options.unshift(single_answer.getRequiredSelector());
    edit_mode_control_options.unshift({
      tag: 'div',
      class: 'modeSelector',
      children: [{ tag: 'div', class: 'modeOption toggled', html: this.type }],
    });
    edit_mode_control_options.unshift({ tag: 'p', class: 'questionNumber', html: 'Q' + template_question_num });

    if (!this.heading) $(this.view_question_DOM).find('p.headingText').addClass('hidden');

    this.edit_question_DOM = DOM.new({ tag: 'div', class: 'questionWrapper', children: edit_mode_control_options });

    if (is_new) {
      //add new question to template, go to question, set question as active
      if (!parent_template.edit_mode) parent_template.toggleView();
      let new_question = parent_template.edit_mode ? $(this.edit_question_DOM) : $(this.view_question_DOM);
      $('#questionnaire-view-template').children().not('.newQuestionModalForm').remove();
      $(new_question).appendTo($('#questionnaire-view-template'));
      $('.questionScrollIcon, .headerScrollIcon, .sectionScrollIcon, .sectionScrollContainer').removeClass('iconActive');
      $(this.scroll_icon).addClass('iconActive');

      parent_template.updateItemCount();
    } else if (parent_question) {
      //if parent_question is defined, this is a sub question

      single_answer.is_sub_question = true;
      single_answer.parent_question = parent_question;

      let edit_mode_sub_question_control_options = [];
      let sub_question_option_fields = [];

      view_mode_fields = [];

      for (let j = 0; j < this.options.length; j++) {
        view_mode_fields.push({
          tag: 'tr',
          class: 'questionOption',
          children: [
            {
              tag: 'td',
              children: [{ tag: 'div', class: 'questionOptionShape' }],
            },
            {
              tag: 'td',
              children: [{ tag: 'p', class: 'questionnaireQuestion', html: this.options[j].label }],
            },
            {
              tag: 'td',
              children: [
                // {tag: "p", class: "goto-label"}
              ],
            },
          ],
        });

        sub_question_option_fields.push(single_answer.createOptionField(j));

        // edit_mode_sub_question_control_options.push(single_answer.createOptionField(j))
      }

      edit_mode_sub_question_control_options.push({
        tag: 'div',
        class: 'sub-question-edit-field-container',
        children: sub_question_option_fields,
      });

      edit_mode_sub_question_control_options.unshift(single_answer.getModeSelector());
      edit_mode_sub_question_control_options.unshift(single_answer.getInstructionField());
      edit_mode_sub_question_control_options.unshift(single_answer.getQuestionField());
      edit_mode_sub_question_control_options.unshift(single_answer.getRequiredSelector());
      edit_mode_sub_question_control_options.unshift({ tag: 'p', class: 'questionNumber', html: this.getSubQuestionNumber() });
      edit_mode_sub_question_control_options.push(single_answer.addOptionRow());
      edit_mode_sub_question_control_options.push(single_answer.addDeclineOptionRow());

      this.edit_question_DOM = DOM.new({ tag: 'div', class: 'subQuestion', children: edit_mode_sub_question_control_options });

      let instruction_class = this.instructions ? 'instructionText' : 'instructionText hidden';

      this.view_question_DOM = DOM.new({
        tag: 'div',
        class: 'wrapper indent subQuestion',
        children: [
          { tag: 'p', class: 'questionNumber', html: this.getSubQuestionNumber() },
          {
            tag: 'div',
            class: 'optionsWrapper',
            children: [{ tag: 'p', class: 'editFieldLabel inline boldText redText', html: 'Required' }],
          },
          { tag: 'p', class: 'questionText smallText', html: this.label },
          { tag: 'p', class: instruction_class, html: this.instructions },
          {
            tag: 'div',
            children: [
              {
                tag: 'div',
                class: 'questionnairePlaceholder hidden',
                children: [{ tag: 'div', class: 'buttonQuestionnaireDropDown' }],
              },
              { tag: 'div', class: 'questionnaireOptions alignLeft', children: view_mode_fields },
            ],
          },
        ],
      });

      $(this.edit_question_DOM).find('.goToMenuButton, .buttonAddSubQuestion, .buttonDeleteSubQuestion').remove();
      $(this.edit_question_DOM).find('.buttonDeleteSubQuestion').hide();
      $(this.edit_question_DOM).find('.questionOption').removeClass('questionOption').addClass('subQuestionOption');

      let view_field;
      let edit_field;

      //not a decline
      if (answer_index > -1) {
        //todo change the use of metadata for this
        parent_question.options[answer_index].sub_question = this.metadata;

        view_field = $($(parent_question.view_question_DOM).find('.questionOption')[answer_index]);
        edit_field = $($(parent_question.edit_question_DOM).find('.questionOption').not('.textOption')[answer_index]);

        //decline option
      } else if (answer_index === -1) {
        parent_question.decline.sub_question = this.metadata;
        view_field = $($(parent_question.view_question_DOM).find('.questionOption').last());
        edit_field = $($(parent_question.edit_question_DOM).find('.declineOption').last());
      }

      $(this.view_question_DOM).insertAfter($(view_field));
      $(this.edit_question_DOM).appendTo($(edit_field));

      $(this.view_question_DOM).find('.questionOption').removeClass('questionOption').addClass('questionnaireSubOption');
      $(this.view_question_DOM).find('.questionnaireOptions').removeClass('questionnaireOptions').addClass('subQuestionOptions');

      $($(edit_field).find('.buttonAddSubQuestion').first()).addClass('hidden');
      $($(edit_field).find('.buttonDeleteSubQuestion').first()).removeClass('hidden');

      // parent_template.updateItemCount();

      //remove questions
      $(single_answer.edit_question_DOM)
        .find('.subQuestionOption')
        .find('.removableAnswer')
        .click(function () {
          let index = $.inArray(
            $(this)[0],
            $(single_answer.edit_question_DOM).find('.subQuestionOption').find('.removableAnswer')
          );
          single_answer.removeOption(index);
          $(this).parent().parent().parent().remove();
        });

      $(single_answer.edit_question_DOM)
        .find('.subQuestionOption')
        .find('.multipleChoiceInput')
        .click(function () {
          let index = $.inArray(
            $(this)[0],
            $(single_answer.edit_question_DOM).find('.subQuestionOption').find('.removableAnswer')
          );
          single_answer.removeOption(index);
          $(this).parent().parent().parent().remove();
        });
    } else {
      //adding sub questions for questions that are being created from json structure
      for (let i = 0; i < this.options.length; i++) {
        if (this.options[i].sub_question) {
          let sub_question = this.options[i].sub_question;
          this.new_sub_question_index = i;
          // this.addNewSubQuestion(sub_question.type, this, i)
          this.createSubQuestion(sub_question, this, i);
        }
      }
    }

    if (single_answer.decline) {
      single_answer.addDeclineOption(single_answer.decline);
    } else {
      single_answer.decline = null;
      single_answer.metadata.decline = null;
    }

    if (this.constructor.name !== 'YesNo2') {
      if (this.is_sub_question) {
        if (this.options.length < 3) {
          $(this.edit_question_DOM).find('.subQuestionOption').children().children().children('.removableAnswer').empty();
        } else {
          $(this.edit_question_DOM)
            .find('.subQuestionOption')
            .children()
            .children()
            .children('.removableAnswer')
            .html(SVG.getBlackCloseOutIcon());
        }
      } else {
        if (this.options.length < 3) {
          $(this.edit_question_DOM).find('.questionOption').children().children().children('.removableAnswer').empty();
        } else {
          $(this.edit_question_DOM)
            .find('.questionOption')
            .children()
            .children()
            .children('.removableAnswer')
            .html(SVG.getBlackCloseOutIcon());
        }
      }
    }

    this.setDisplayMode(this.mode);
    if (!this.is_sub_question && !is_new) {
      $(this.branching_icon).find('img').attr('src', this.scroll_icon_src);
      this.inspectErrors();
    }

    //this.makeEditable();
  }

  updateOptions() {
    let question = this;
    let container_class = this.is_sub_question ? '.sub-question-edit-field-container' : '.question-edit-field-container';
    let option_class = this.is_sub_question ? '.subQuestionOption' : '.questionOption';

    let view_mode_container_class = this.is_sub_question ? '.subQuestionOptions' : '.questionnaireOptions';
    let view_mode_option_class = '.questionnaireQuestion';
    let options = [];

    $.each($(question.edit_question_DOM).find(container_class).children(option_class), function (index, value) {
      let response = $(value).find('.optionField').val();
      let response_value = $(value).find('.optionValueField').val();

      // console.log($(value))

      // todo should use uuid of some kind here
      // using response and value as a double check should be enough to ensure uniqueness, but not perfect
      for (let option of question.options) {
        if (option.value === response_value) {
          if (option.label === response) {
            options.push(option);
          }
        }
      }
    });

    question.options = options;

    let parent = $(question.view_question_DOM).find(view_mode_container_class);

    let items = [];

    // console.log($(question.view_question_DOM).find(view_mode_container_class).children())

    for (let option of question.options) {
      $.each($(question.view_question_DOM).find(view_mode_container_class).children(), function (index, value) {
        // todo should use uuid of some kind here
        // using response and value as a double check should be enough to ensure uniqueness, but not perfect

        if (option.label === $(value).find(view_mode_option_class).html()) {
          //todo fix this bug!!!

          //todo sub question droppping off in view mode
          items.push($(value));

          // get sibling sub question element if valid
          if (option.sub_question) {
            let index = $(parent).children().index($(value));
            let sub_question = $(parent)
              .children()
              .get(index + 1);
            items.push($(sub_question));
          }
        }
      });
    }

    $(parent).empty();

    for (let item of items) $(item).appendTo(parent);

    // if a sub question, we need to update and save in reference to the parent question
    if (question.is_sub_question) {
      if (question.parent_question.options[question.answer_index]) {
        question.parent_question.options[question.answer_index].sub_question = question;
      }
    }

    for (let option of question.options) {
      let sub_question_number = '';

      // TODO can replace all undefined conditionals with 'truthy' check in JS,
      // returns false for null and undefined values

      // console.log(question.options)

      if (option.sub_question) {
        let sub_question = question.parent_template.getItemById(option.sub_question.id);

        // console.log(option.sub_question)

        let char = 'a';
        let index = question.options.indexOf(option);

        // console.log(index)
        while (index > 0) {
          char = Utils.nextAlphabetChar(char);
          index--;
        }
        sub_question_number = 'Q' + question.question_num + '-' + char.toUpperCase();

        $(sub_question.edit_question_DOM).find('p.questionNumber').html(sub_question_number);
        $(sub_question.view_question_DOM).find('p.questionNumber').html(sub_question_number);
      }
    }
    question.parent_template.save();
  }

  setEditableAll() {
    let question = this;
    question.makeEditable();
    let sub_question = null;

    for (let option of question.options) {
      if (option.sub_question) {
        sub_question = question.parent_template.getItemById(option.sub_question.id);
        if (sub_question) sub_question.makeEditable();
      }
    }
  }

  makeEditable() {
    let single_answer = this;
    let template = this.parent_template;
    let container_class = this.is_sub_question ? '.sub-question-edit-field-container' : '.question-edit-field-container';
    let option_class = this.is_sub_question ? '.subQuestionOption' : '.questionOption';
    let container = $(this.edit_question_DOM).find(container_class);

    $(this.edit_question_DOM)
      .find(container_class)
      .sortable({
        axis: 'y',
        forcePlaceholderSize: true,
        handle: '.buttonMoveQuestionnaireOption',
        placeholder: 'reorder-option-placeholder',
        containment: container,
        tolerance: 'pointer',
        start: function () {
          $(single_answer.edit_question_DOM).find(container_class).sortable('refreshPositions');
        },

        helper: function (e, li) {
          this.copyHelper = li.clone().insertAfter(li);
          $(this).data('copied', false);
          let clone = li.clone().addClass('reorderItemClone');
          $(clone).find('.subQuestion, .optionValueWrapper').remove();
          return clone;
        },
        cancel: function () {
          $(single_answer.edit_question_DOM).find('.originalQuestionPlaceholder').removeClass('originalQuestionPlaceholder');
          $(single_answer.edit_question_DOM)
            .find('.' + option_class)
            .height('auto');
          $(single_answer.edit_question_DOM).find('.subQuestion').show();
          $(single_answer.edit_question_DOM).find(container_class).height('auto');
          $('#questionnaire-view-template').height('auto');
          $(single_answer.edit_question_DOM).height('auto');
        },
        stop: function () {
          $(single_answer.edit_question_DOM).find('.originalQuestionPlaceholder').removeClass('originalQuestionPlaceholder');
          $(single_answer.edit_question_DOM).find('.subQuestion').removeClass('hidden');
          $(single_answer.edit_question_DOM).find('.subQuestion').show().height('auto');
          $(single_answer.edit_question_DOM).find(container_class).height('auto');
          $(single_answer.edit_question_DOM).find(option_class).height('auto');
          $(single_answer.edit_question_DOM).height('auto');
          $('#questionnaire-view-template').height('auto');

          setTimeout(function () {
            single_answer.updateOptions();
          }, 100);

          let copied = $(this).data('copied');
          if (!copied) this.copyHelper.remove();
          this.copyHelper = null;
        },
      });
  }

  //fields
  createOptionField(j) {
    //TODO change this so that is works generally for adding new answers, or creating existing ones from the json
    //pass in metadata for existing answer, no parameter for new answer
    //creates options field at given index

    let single_answer = this;
    let parent_template = this.parent_template;
    let value = this.options[j].value ? this.options[j].value : this.options[j].label ? this.options[j].label : '';
    let goto = this.options[j].go_to;
    let goto_label = 'Go To';

    let container_class = single_answer.is_sub_question ? '.sub-question-edit-field-container' : '.question-edit-field-container';
    let option_class = single_answer.is_sub_question ? 'subQuestionOption' : 'questionOption';
    let view_class = single_answer.is_sub_question ? 'questionnaireSubOption' : 'questionOption';

    let goto_dom = single_answer.is_sub_question
      ? null
      : {
        tag: 'div',
        class: 'goToContainer',
        children: [
          {
            tag: 'div',
            class: 'goToMenuButton',
            click: function (e) {
              let button = this;
              single_answer.toggleGoToMenu(e, button, false);
            },
            children: [
              {
                tag: 'table',
                class: 'fullSize',
                children: [
                  {
                    tag: 'tr',
                    children: [
                      {
                        tag: 'td',
                        class: 'metadataItemText',
                        children: [{ tag: 'p', class: 'menuButtonLabel', html: goto_label }],
                      },
                      {
                        tag: 'td',
                        class: 'metadataItemText',
                        children: [
                          { tag: 'div', class: 'buttonDropdown' },
                          {
                            tag: 'div',
                            class: 'buttonDeleteGoTo hidden',
                            html: SVG.getBlackCloseOutIcon(),
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
              {
                tag: 'div',
                class: 'goToDropDownMenu hideScrollBar',
                click: function (e) {
                  // e.preventDefault();
                  // e.stopPropagation();
                },
              },
            ],
          },
        ],
      };

    let sub_question_add_btn = single_answer.is_sub_question
      ? null
      : {
        tag: 'div',
        class: 'buttonAddSubQuestion',
        click: function () {
          let sub_question_buttons = $(single_answer.edit_question_DOM).find('.buttonAddSubQuestion');
          let index = $.inArray($(this)[0], sub_question_buttons);

          single_answer.new_sub_question_index = index;
          single_answer.getSubQuestionForm(index, false);
        },
        children: [
          { tag: 'p', class: 'subQuestionLabel', html: 'Sub Question' },
          { tag: 'button', class: 'buttonAddSubQuestionIcon', label: SVG.getPlusSign() },
        ],
      };

    let sub_question_del_btn = single_answer.is_sub_question
      ? null
      : {
        tag: 'div',
        class: 'buttonDeleteSubQuestion hidden',
        click: function () {
          single_answer.deleteSubQuestion(this);
        },
        children: [
          { tag: 'p', class: 'subQuestionLabel', html: 'Sub Question' },
          { tag: 'button', class: 'buttonDeleteSubQuestionIcon', label: SVG.getBlackCloseOutIcon() },
        ],
      };

    return {
      tag: 'div',
      class: option_class,
      children: [
        {
          tag: 'div',
          class: 'questionOptionWrapper',
          children: [
            {
              tag: 'button',
              style: ['buttonMoveQuestionnaireOption'],
              label: SVG.getMoveQuestionnaireItemsIcon(),
              mousedown: function () {
                // highlight draggable element
                $(this).parent().parent().addClass('originalQuestionPlaceholder');

                // set parent container height before collapsing
                // let parent_height = $("#questionnaire-view-template").height()
                // $("#questionnaire-view-template").height(parent_height)

                let question_container_height = $(single_answer.edit_question_DOM).height();
                $(single_answer.edit_question_DOM).height(question_container_height);

                // // // set sortable container height as well
                // let sortable_height = $(single_answer.edit_question_DOM).find(container_class).height()
                // $(single_answer.edit_question_DOM).find(container_class).height(sortable_height)

                // store selected row offset
                let offset = $(this).offset().top;

                // hide all sub questions to make dragging easier
                $(single_answer.edit_question_DOM).find('.subQuestion').hide();

                // set height of all draggable rows
                $.each($(single_answer.edit_question_DOM).find('.' + option_class), function (index, value) {
                  let height = $(value).height();
                  $(value).height(height);
                });

                // // sortable container height
                // let height = $(single_answer.edit_question_DOM).find(".question-edit-field-container").height()
                // $(single_answer.edit_question_DOM).find(".question-edit-field-container").height(height)

                let top_offset_diff = offset - $(this).offset().top;

                // console.log(top_offset_diff)

                if (top_offset_diff !== 0)
                  $(
                    $('#questionnaire-view-template').scrollTop(
                      $('#questionnaire-view-template').scrollTop() - top_offset_diff
                    )
                  );
              },
              mouseup: function () {
                $(this).parent().parent().removeClass('originalQuestionPlaceholder');
                $(single_answer.edit_question_DOM)
                  .find('.' + option_class)
                  .height('auto');
                $(single_answer.edit_question_DOM).find(container_class).height('auto');
                $('#questionnaire-view-template').height('auto');
                $(single_answer.edit_question_DOM).height('auto');
                $(single_answer.edit_question_DOM).find('.subQuestion').show();
                $(single_answer.edit_question_DOM)
                  .find('.question-edit-field-container, .sub-question-edit-field-container')
                  .height('auto');
              },
            },

            {
              tag: 'button',
              style: ['MultipleChoiceBubble', 'removableAnswer'],
              up_action: function () {
                single_answer.removeOption(j);
                $(this).parent().parent().remove();
              },
              label: SVG.getBlackCloseOutIcon(),
            },

            {
              tag: 'textarea',
              class: 'optionField',
              rows: 1,
              html: this.options[j].label,
              keyup: function (e) {
                let code = e.keyCode || e.which;
                if (code === 9) {
                  e.preventDefault();
                  return;
                }

                if (parent_template.update_timer !== null) clearTimeout(parent_template.update_timer);
                let input = $(this);
                parent_template.update_timer = setTimeout(function () {
                  single_answer.options[j].label = $(input).val().trim();
                  single_answer.options[j].value = Utils.formatVariableName($(input).val().trim());

                  $(input)
                    .parent()
                    .parent()
                    .children('.optionValueWrapper')
                    .children('.optionValueField')
                    .val(single_answer.options[j].value);

                  $(
                    $(single_answer.view_question_DOM)
                      .find('.' + view_class)
                      .get(j)
                  )
                    .children('td')
                    .children('p.questionnaireQuestion')
                    .width('auto');

                  $(
                    $(single_answer.view_question_DOM)
                      .find('.' + view_class)
                      .get(j)
                  )
                    .children('td')
                    .children('p.questionnaireQuestion')
                    .html($(input).val().trim());

                  if ($(input).val())
                    $(
                      $(single_answer.view_question_DOM)
                        .find('.' + view_class)
                        .get(j)
                    )
                      .children('tr')
                      .children('td')
                      .children('p.questionnaireQuestion')
                      .removeClass('redText');

                  if (single_answer.is_sub_question) {
                    single_answer.parent_question.inspectErrors();
                  } else {
                    single_answer.inspectErrors();
                  }
                }, 250);
              },
              input: function () {
                //resize field on input
                $(this).outerHeight(this.scrollHeight);
              },
            },
            goto_dom,
            sub_question_add_btn,
            sub_question_del_btn,
          ],
        },
        single_answer.getVariableNameField(j),
      ],
    };
  }
  getVariableNameField(index) {
    let single_answer = this;
    let parent_template = this.parent_template;
    let value = single_answer.options[index].value;

    return {
      tag: 'div',
      class: 'optionValueWrapper',
      children: [
        {
          tag: 'input',
          class: 'optionValueField',
          value: value,
          keydown: function (e) {
            // if (!Utils.charWhitelist.includes(e.which) || e.shiftKey) e.preventDefault();
            // if (!Utils.charWhitelist.includes(e.which)) e.preventDefault();
          },
          blur: function () {
            single_answer.options[index].value = $(this).val().trim();
            single_answer.inspectErrors();
          },
          keyup: function () {
            let input = $(this);
            if (parent_template.update_timer) clearTimeout(parent_template.update_timer);
            let value = $(input).val().trim();
            clearTimeout(parent_template.update_timer);
            parent_template.update_timer = setTimeout(function () {
              single_answer.value = Utils.formatVariableName(value);
              single_answer.metadata.value = single_answer.value;
              $(input).val(single_answer.value);
              single_answer.inspectErrors();
            }, 1000);
          },
        },
      ],
    };
  }
  addOptionRow() {
    let single_answer = this;

    return {
      tag: 'div',
      class: 'addOptionWrapper',
      click: function () {
        single_answer.addOption();
      },
      children: [
        { tag: 'button', label: SVG.getBlackPlusSign(), style: ['buttonAddAnswer'] },
        { tag: 'p', class: 'addNewOptionLabel', html: 'Add Answer' },
      ],
    };
  }
  addDeclineOptionRow() {
    let single_answer = this;

    return {
      tag: 'div',
      class: 'addDeclineOptionWrapper',
      children: [
        { tag: 'button', label: SVG.getBlackPlusSign(), style: ['buttonAddAnswer'] },
        { tag: 'p', class: 'addNewOptionLabel', html: 'Add Decline Option' },
      ],
      click: function () {
        if (single_answer.decline) {
          //metadata
          single_answer.decline = null;

          if (single_answer.is_sub_question) {
            $(single_answer.edit_question_DOM).find('.subQuestion .declineOption').remove();
            $(single_answer.edit_question_DOM).find('.subQuestion .addDeclineOptionWrapper').removeClass('hidden');
          } else {
            $(single_answer.edit_question_DOM).find('.questionWrapper > .declineOption').remove();
            $(single_answer.edit_question_DOM).find('.questionWrapper > .addDeclineOptionWrapper').removeClass('hidden');
          }

          //remove ui item
          // $(single_answer.edit_question_DOM).find(".declineOption").remove();
          // $(single_answer.edit_question_DOM).find(".addDeclineOptionRow").children(".buttonAddAnswer").html(SVG.getBlackPlusSign())
          // $(single_answer.edit_question_DOM).find(".addDeclineOptionRow").children("p").html("Add Decline Option");

          //decline with always be last option
          // $(single_answer.view_question_DOM).find(".questionOption").last().remove();
          single_answer.parent_template.save();
        } else {
          single_answer.addDeclineOption();
        }
      },
    };
  }

  //mode options
  getModeSelector() {
    let single_answer = this;

    return {
      tag: 'div',
      class: 'questionModeWrapper',
      children: [
        {
          tag: 'div',
          class: 'modeSelector',
          children: [
            {
              tag: 'div',
              class: 'modeOption',
              html: 'List',
              click: function () {
                single_answer.setDisplayMode('list');
              },
            },
            {
              tag: 'div',
              class: 'modeOption',
              html: 'Menu',
              click: function () {
                single_answer.setDisplayMode('menu');
              },
            },
          ],
        },
      ],
    };
  }
  setDisplayMode(mode) {
    //alter view mode appearance based on display mode

    //list is the standard view
    //menu view looks like a static drop down list

    this.mode = mode;
    this.metadata.mode = mode;

    let options_wrapper = $($(this.edit_question_DOM).find('.questionModeWrapper')[0]);
    let view_mode_options_wrapper = $($(this.view_question_DOM).find('.questionnaireOptions')[0]);
    let view_mode_options = $($(this.view_question_DOM).find('.questionOption'));
    let menu_placeholder = $($(this.view_question_DOM).find('.questionnairePlaceholder')[0]);

    if ($(this.edit_question_DOM).hasClass('subQuestion')) {
      view_mode_options_wrapper = $(this.view_question_DOM).find('.subQuestionOptions');
      view_mode_options = $($(this.view_question_DOM).find('.questionnaireSubOption'));
    }

    options_wrapper.children('.modeSelector').children('.toggled').removeClass('toggled');

    if (mode === 'list') {
      view_mode_options.find('.questionOptionShape').show();
      view_mode_options.find('.questionOptionShape').removeClass('hidden');

      view_mode_options_wrapper.find('.questionOption').removeClass('dropDownViewMode');
      view_mode_options_wrapper.removeClass('dropDownViewQuestionContainer');

      options_wrapper.find('.radioButtonQuestionnaire').removeClass('radioButtonActive');
      options_wrapper.find('.radioButtonQuestionnaire').last().addClass('radioButtonActive');
      $(options_wrapper.children('.modeSelector').children('.modeOption')[0]).addClass('toggled');

      menu_placeholder.addClass('hidden');
    } else {
      //hide answer bubbles
      view_mode_options.find('.questionOptionShape').addClass('hidden');
      menu_placeholder.removeClass('hidden');

      //add drop down styling
      view_mode_options.addClass('dropDownViewMode');
      view_mode_options_wrapper.addClass('dropDownViewQuestionContainer');

      options_wrapper.find('.radioButtonQuestionnaire').removeClass('radioButtonActive');
      options_wrapper.find('.radioButtonQuestionnaire').first().addClass('radioButtonActive');
      $(options_wrapper.children('.modeSelector').children('.modeOption')[1]).addClass('toggled');
    }

    if (!this.required || !this.hasOwnProperty('required')) $(this.view_question_DOM).find('.optionsWrapper').addClass('hidden');

    this.parent_template.save();
  }

  //sub questions
  deleteSubQuestion(button) {
    let snippet =
      $(button).parent().find('textarea').html().length > 30
        ? $(button).parent().find('textarea').html().substring(0, 30) + '...'
        : $(button).parent().find('textarea').html();

    let question = this;
    let text = "Do you really want to delete the sub question for answer: \n'<b>" + snippet + "</b>'?";
    let parent_template = this.parent_template;

    if (!parent_template.delete_sub_question_form) {
      //delete sub question form
      parent_template.delete_sub_question_form = DOM.new({
        tag: 'div',
        class: 'deleteSubQuestionForm hideScrollBar',
        parent: Content.div,
        children: [
          {
            tag: 'div',
            class: 'containerBottomBar hideScrollBar',
            style: 'overflow-y: visible',
            children: [
              { tag: 'p', class: 'formTitle', html: 'Delete Sub Question?' },
              {
                tag: 'div',
                class: 'wrapperNoPad centerText',
                children: [{ tag: 'p', class: 'formText inline' }],
              },
              {
                tag: 'div',
                class: 'questionReorderControlBar',
                children: [
                  {
                    tag: 'button',
                    label: 'Cancel',
                    class: 'buttonCancelForm',
                    up_action: function () {
                      $('#modal-secondary').fadeOut(300);
                      $(parent_template.delete_sub_question_form).fadeOut(300);
                    },
                  },
                  {
                    tag: 'button',
                    id: 'button-delete-sub-question',
                    label: 'Delete Sub Question',
                    class: 'buttonDeleteSection',
                    up_action: function () {},
                  },
                ],
              },
            ],
          },
        ],
      });
    }

    $(parent_template.delete_sub_question_form).fadeIn();
    $(parent_template.delete_sub_question_form).find('p.formText').html(text);
    let height = 148 + $(parent_template.delete_sub_question_form).find('p.formText').height();
    $(parent_template.delete_sub_question_form).height(height);

    $('#modal-secondary').fadeIn(300);
    $('#button-delete-sub-question').unbind();
    $('#button-delete-sub-question').click(function () {
      $(button).parent().find('.buttonAddSubQuestion').removeClass('hidden');
      $(button).addClass('hidden');

      let button_parent = $(button).parent().parent();
      $(button_parent).find('.subQuestion').remove();

      let index = $.inArray(
        $(button_parent)[0],
        $(question.edit_question_DOM).find('.question-edit-field-container').children('.questionOption')
      );
      $($(question.view_question_DOM).find('.questionOption')[index]).next('.subQuestion').remove();
      $('#modal-secondary').fadeOut(300);
      $(parent_template.delete_sub_question_form).fadeOut(300);

      //if index is greater than options array length, use decline option

      if (index === question.options.length) {
        question.decline.sub_question = null;
      } else {
        question.options[index].sub_question = null;
      }
      parent_template.save();
    });
  }
  getSubQuestionForm(answer_index, is_decline) {
    let parent_template = this.parent_template;
    let question = this;
    let index = is_decline ? -1 : answer_index;

    if (!this.add_sub_question_form) {
      //new question form
      this.add_sub_question_form = DOM.new({
        tag: 'div',
        class: 'subQuestionModalForm',
        parent: $('#questionnaire-viewer'),
        children: [
          {
            tag: 'div',
            class: 'containerBottomBar hideScrollBar',
            children: [
              { tag: 'p', class: 'headerLabel', html: 'New Sub Question' },
              //question types
              {
                tag: 'div',
                class: 'wrapper',
                children: [
                  {
                    tag: 'button',
                    class: 'buttonQuestionOption',
                    label: 'Yes / No',
                    up_action: function () {
                      // $(parent_template.new_question_form).fadeOut();
                      // $("#questionnaire-modal").fadeOut();
                      // question.addNewSubQuestion($(this).html(), question, index);
                    },
                  },
                  {
                    tag: 'button',
                    class: 'buttonQuestionOption',
                    label: 'Single Select',
                    up_action: function () {
                      // $(parent_template.new_question_form).fadeOut();
                      // $("#questionnaire-modal").fadeOut();
                      // question.addNewSubQuestion($(this).html(), question, index);
                    },
                  },
                  {
                    tag: 'button',
                    class: 'buttonQuestionOption',
                    label: 'Multi Select',
                    up_action: function () {
                      // $(parent_template.new_question_form).fadeOut();
                      // $("#questionnaire-modal").fadeOut();
                      // question.addNewSubQuestion($(this).html(), question, index);
                    },
                  },
                ],
              },

              {
                tag: 'div',
                class: 'wrapper centerText',
                children: [
                  {
                    tag: 'button',
                    class: 'buttonQuestionOption',
                    label: 'Range',
                    up_action: function () {
                      // $(parent_template.new_question_form).fadeOut();
                      // $("#questionnaire-modal").fadeOut();
                      // question.addNewSubQuestion($(this).html(), question, index);
                    },
                  },
                  {
                    tag: 'button',
                    class: 'buttonQuestionOption textFieldOption',
                    label: 'Text Field(s)',
                    up_action: function () {
                      // $(parent_template.new_question_form).fadeOut();
                      // $("#questionnaire-modal").fadeOut();
                      // question.addNewSubQuestion("Multi Text", question, index);
                    },
                  },
                ],
              },
            ],
          },
          {
            tag: 'div',
            class: 'questionReorderControlBar',
            children: [
              {
                tag: 'button',
                label: 'Cancel',
                class: 'buttonCancelForm',
                up_action: function () {
                  $(question.add_sub_question_form).fadeOut();
                  $('#questionnaire-modal').fadeOut();
                },
              },
            ],
          },
        ],
      });
    }

    // $(this.add_sub_question_form).();

    Utils.fadeIn($(this.add_sub_question_form), 'block', 350);

    let click_action = function () {
      $(parent_template.add_sub_question_form).fadeOut();
      $('#questionnaire-modal').fadeOut();
      question.addNewSubQuestion($(this).html(), question, index, is_decline);
    };

    let text_field_click_action = function () {
      $(parent_template.add_sub_question_form).fadeOut();
      $('#questionnaire-modal').fadeOut();
      question.addNewSubQuestion('Multi Text', question, index, is_decline);
    };

    $(this.add_sub_question_form).find('.buttonQuestionOption').off();
    $(question.add_sub_question_form).find('.buttonQuestionOption').not('.textFieldOption').click(click_action);
    $(question.add_sub_question_form).find('.textFieldOption').click(text_field_click_action);

    $('#questionnaire-modal').fadeIn();
  }
  createSubQuestion(metadata, parent_question, answer_index) {
    // let answer_index = parent_question.new_sub_question_index;

    //pass in parent_question object to hold new sub question

    let template = this.parent_template;

    if (parent_question && metadata) {
      switch (metadata.type) {
        case 'Yes / No': {
          new YesNo2(metadata, template, null, null, null, false, parent_question, answer_index);
          break;
        }
        case 'Single Select': {
          new SingleAnswer2(metadata, template, null, null, null, false, parent_question, answer_index);
          break;
        }
        case 'Multi Select': {
          new MultiAnswer2(metadata, template, null, null, null, false, parent_question, answer_index);
          break;
        }
        case 'Multi Text': {
          new MultiText(metadata, template, null, null, null, false, parent_question, answer_index);
          break;
        }
        case 'Range': {
          new RangeAnswer2(metadata, template, null, null, null, false, parent_question, answer_index);
          break;
        }
        case 'Text': {
          new TextPage(metadata, template, null, null, null, false, parent_question, answer_index);
          break;
        }
      }
    }
  }
  addNewSubQuestion(type, parent_question, answer_index, is_decline) {
    if (answer_index) answer_index = parent_question.new_sub_question_index;
    if (is_decline) answer_index = -1;

    //pass in parent_question object to hold new sub question

    let template = this.parent_template;

    if (parent_question) {
      let metadata;

      switch (type) {
        case 'Yes / No': {
          metadata = {
            type: 'Yes / No',
            required: template.required_default,
            heading: null,
            label: 'Enter your question text',
            value: 'enter_your_question_text',
            mode: 'list',
            options: [
              {
                value: 'yes',
                label: 'Yes',
                goto: null,
              },
              {
                value: 'no',
                label: 'No',
                goto: null,
              },
            ],
          };
          new YesNo2(metadata, template, null, null, null, false, parent_question, answer_index);
          break;
        }
        case 'Single Select': {
          metadata = {
            type: 'Single Select',
            label: 'Please select one of the following:',
            value: 'please_select_one_of_the_follo',
            heading: null,
            instructions: null,
            mode: 'list',
            options: [
              {
                value: 'response_1',
                label: 'Response 1',
                goto: null,

                sub_question: null,
              },
              {
                value: 'response_2',
                label: 'Response 2',
                goto: null,

                sub_question: null,
              },
              {
                value: 'response_3',
                label: 'Response 3',
                goto: null,

                sub_question: null,
              },
              {
                value: 'response_4',
                label: 'Response 4',
                goto: null,

                sub_question: null,
              },
            ],
            defaults: 1,
            min: 1,
            max: 1,
          };
          new SingleAnswer2(metadata, template, null, null, null, false, parent_question, answer_index);
          break;
        }
        case 'Multi Select': {
          metadata = {
            type: 'Multi Select',
            label: 'Please select one or more of the following:',
            value: 'please_select_one_or_more_of_t',
            heading: null,
            instructions: null,
            decline: null,
            options: [
              {
                value: 'response_1',
                label: 'Response 1',
                goto: null,

                sub_question: null,
              },
              {
                value: 'response_2',
                label: 'Response 2',
                goto: null,

                sub_question: null,
              },
              {
                value: 'response_3',
                label: 'Response 3',
                goto: null,

                sub_question: null,
              },
              {
                value: 'response_4',
                label: 'Response 4',
                goto: null,

                sub_question: null,
              },
            ],
            required: template.required_default,
          };
          new MultiAnswer2(metadata, template, null, null, null, false, parent_question, answer_index);
          break;
        }
        case 'Multi Text': {
          metadata = {
            type: 'Multi Text',
            heading: null,
            questions: [
              {
                type: 'Text Field',
                required: template.required_default,
                heading: null,
                label: 'Response 1',
                value: 'response_1',
                instructions: null,
              },
            ],
          };
          new MultiText(metadata, template, null, null, null, false, parent_question, answer_index);
          break;
        }

        case 'Range': {
          metadata = {
            type: 'Range',
            label: 'Please rate the following from 1 (the least likely) to 10 (the most likely):',
            value: 'please_rate_the_following_from',
            heading: null,
            instructions: null,
            range: {
              min: 1,
              max: 10,
            },
            decline: null,
            required: template.required_default,
          };
          new RangeAnswer2(metadata, template, null, null, null, false, parent_question, answer_index);
          break;
        }

        case 'Text': {
          metadata = {
            type: 'Text',
            required: template.required_default,
            heading: null,
          };
          new TextPage(metadata, template, null, null, null, false, parent_question, answer_index);
          break;
        }
      }
    }
  }

  //answer options
  removeOption(answer_index) {
    let single_answer = this;

    let option = this.options[answer_index];

    if (option) {
      if (option.sub_question) {
        let sub_question = this.parent_template.getItemById(option.sub_question.id);
        $(sub_question.view_question_DOM).remove();
      }
    }

    //remove item and sub question
    this.options.splice(answer_index, 1);

    if (this.is_sub_question) {
      if (this.options.length < 3) $(this.edit_question_DOM).find('.questionOptionWrapper').children('.removableAnswer').empty();
      $($(this.view_question_DOM).find('.questionnaireSubOption')[answer_index]).remove();

      setTimeout(function () {
        single_answer.parent_question.inspectErrors();
      }, 500);
    } else {
      if (this.options.length < 3) $(this.edit_question_DOM).find('.questionOptionWrapper').children('.removableAnswer').empty();
      $($(this.view_question_DOM).find('.questionOption')[answer_index]).remove();

      setTimeout(function () {
        single_answer.inspectErrors();
      }, 500);
    }
  }
  addOption() {
    let j = this.options.length;

    let label = 'Response ' + (this.options.length + 1);
    let value = Utils.formatVariableName(label);

    this.options.push({
      label: label,
      value: value,
      go_to: null,
      sub_question: null,
    });

    let goto_label = 'Go To';
    let single_answer = this;
    let parent_template = this.parent_template;
    let option_class = this.is_sub_question ? 'subQuestionOption' : 'questionOption';
    let view_mode_class = this.is_sub_question ? 'questionnaireSubOption' : 'questionOption';
    let container_class = this.is_sub_question ? '.sub-question-edit-field-container' : '.question-edit-field-container';

    let new_option = DOM.new(single_answer.createOptionField(j));

    let shape_class = single_answer.mode === 'menu' ? 'questionOptionShape hidden' : 'questionOptionShape';

    let view_mode_answer = DOM.new({
      tag: 'tr',
      class: view_mode_class,
      children: [
        {
          tag: 'td',
          children: [{ tag: 'div', class: shape_class }],
        },
        {
          tag: 'td',
          children: [{ tag: 'p', class: 'questionnaireQuestion', html: this.options[j].label }],
        },
        {
          tag: 'td',
          children: [{ tag: 'p', class: 'goto-label' }],
        },
      ],
    });

    //if question has a decline option, insert new answers BEFORE decline
    //otherwise, insert after last question option

    if (this.decline) {
      if (this.is_sub_question) {
        $(view_mode_answer).insertBefore($(this.view_question_DOM).find('.questionnaireSubOption.declineOption'));
        $(new_option).insertBefore($(this.edit_question_DOM).find('.declineOption.subQuestionOption'));
      } else {
        $(view_mode_answer).insertBefore(
          $(this.view_question_DOM)
            .children('.dropDownViewModeContainer')
            .children('.questionnaireOptions')
            .children('.questionOption.declineOption')
        );
        $(new_option).insertBefore($(this.edit_question_DOM).find(container_class).children('.declineOption.questionOption'));
      }
    } else {
      if (this.is_sub_question) {
        $(view_mode_answer).appendTo($(this.view_question_DOM).find('.subQuestionOptions'));
        $(new_option).insertAfter($(this.edit_question_DOM).children(container_class).find('.subQuestionOption').last());
      } else {
        $(view_mode_answer).appendTo($(this.view_question_DOM).find('.dropDownViewModeContainer > .questionnaireOptions'));
        $(new_option).insertAfter($(this.edit_question_DOM).children(container_class).find('.questionOption').last());
      }
    }

    if (this.is_sub_question) $(new_option).find('.goToContainer, .buttonDeleteSubQuestion, .buttonAddSubQuestion').remove();

    //todo create function to perform this as part of update empty content
    if (this.options.length >= 3)
      $(this.edit_question_DOM)
        .find('.questionOption')
        .children()
        .children()
        .children('.removableAnswer')
        .html(SVG.getBlackCloseOutIcon());

    single_answer.parent_template.save();
  }
  addDeclineOption() {
    let single_answer = this;
    let parent_template = this.parent_template;
    // let answer_class = (this.is_sub_question) ? "subQuestionOption declineOption" : "questionOption declineOption";

    //default text
    if (!single_answer.decline) {
      single_answer.decline = { label: 'Prefer not to answer' };
      single_answer.metadata.decline = { label: 'Prefer not to answer' };
    } else {
      if (!single_answer.decline.label) {
        single_answer.decline = { label: 'Prefer not to answer' };
        single_answer.metadata.decline = { label: 'Prefer not to answer' };
      }
    }

    let goto_label = 'Go To';

    single_answer.decline.value = single_answer.decline.value
      ? Utils.formatVariableName(single_answer.decline.value)
      : Utils.formatVariableName(single_answer.decline.label);

    let option_class = single_answer.is_sub_question ? 'declineOption subQuestionOption' : 'declineOption questionOption';
    let view_mode_selector_class = single_answer.is_sub_question
      ? '.declineOption.questionnaireSubOption'
      : '.declineOption.questionOption';
    let view_class = single_answer.is_sub_question ? 'declineOption questionnaireSubOption' : 'declineOption questionOption';

    let new_answer = DOM.new({
      tag: 'div',
      class: option_class,
      children: [
        {
          tag: 'div',
          class: 'declineOptionWrapper',
          children: [
            { tag: 'p', class: 'declineLabel', html: 'Decline Option' },
            {
              tag: 'button',
              style: ['MultipleChoiceBubble', 'removableAnswer'],
              up_action: function () {
                //metadata
                if (single_answer.decline.sub_question) {
                  let sub_question = single_answer.parent_template.getItemById(single_answer.decline.sub_question.id);
                  $(sub_question.view_question_DOM).remove();
                }

                single_answer.decline = null;
                if (single_answer.is_sub_question) {
                  //edit list item
                  $(single_answer.edit_question_DOM).find('.subQuestionOption.declineOption').remove();

                  //edit wrapper
                  $(single_answer.edit_question_DOM).find('.addDeclineOptionWrapper').removeClass('hidden');

                  $(single_answer.view_question_DOM).find('.questionnaireSubOption.declineOption').remove();
                } else {
                  $(single_answer.edit_question_DOM).children('.addDeclineOptionWrapper').removeClass('hidden');
                  $(single_answer.edit_question_DOM).find('.questionOption.declineOption').remove();

                  $(single_answer.view_question_DOM).find('.questionOption.declineOption').remove();

                  // $(single_answer.edit_question_DOM).find(".questionWrapper > .addDeclineOptionWrapper").removeClass("hidden");
                }

                setTimeout(function () {
                  single_answer.inspectErrors();
                }, 500);
              },
              label: SVG.getBlackCloseOutIcon(),
            },

            {
              tag: 'textarea',
              class: 'optionField',
              rows: 1,
              html: single_answer.decline.label,
              keyup: function () {
                if (parent_template.update_timer !== null) clearTimeout(parent_template.update_timer);

                let input = $(this);

                parent_template.update_timer = setTimeout(function () {
                  single_answer.decline.label = $(input).val().trim();
                  single_answer.decline.value = Utils.formatVariableName($(input).val().trim());

                  let value_field = $('#questionnaire-view-template')
                    .find('.declineOption .optionValueField')
                    .not('.subQuestion .optionValueField');

                  $(value_field).val(single_answer.decline.value);

                  // $(input).parent().parent().find(".declineOption input").not(".subQuestion input").val(single_answer.decline.value);
                  //
                  // console.log($(input).parent().parent().find(".optionValueField"))

                  // single_answer.metadata.decline.label = single_answer.decline.label;

                  if ($(input).val()) {
                    $($(single_answer.view_question_DOM).find(view_mode_selector_class))
                      .children('td')
                      .children('p.questionnaireQuestion, p.questionnaireSubQuestion')
                      .html($(input).val().trim())
                      .removeClass('redText');
                    // $($(single_answer.edit_question_DOM).find(".optionValueField")[j]).val(Utils.formatVariableName($(input).val().trim()));
                  } else {
                    $($(single_answer.view_question_DOM).find(view_mode_selector_class))
                      .children('td')
                      .children('p.questionnaireQuestion, p.questionnaireSubQuestion')
                      .html(Questionnaires.NO_ANSWER_TEXT)
                      .addClass('redText');
                  }

                  single_answer.inspectErrors();
                }, 250);
              },
              input: function () {
                //resize field on input
                $(this).outerHeight(this.scrollHeight);
              },
            },

            {
              tag: 'div',
              class: 'goToContainer',
              children: [
                {
                  tag: 'div',
                  class: 'goToMenuButton',
                  click: function (e) {
                    let button = this;
                    single_answer.toggleGoToMenu(e, button, true);
                  },
                  children: [
                    {
                      tag: 'table',
                      class: 'fullSize',
                      children: [
                        {
                          tag: 'tr',
                          children: [
                            {
                              tag: 'td',
                              class: 'metadataItemText',
                              children: [{ tag: 'p', class: 'menuButtonLabel', html: goto_label }],
                            },
                            {
                              tag: 'td',
                              class: 'metadataItemText',
                              children: [
                                { tag: 'div', class: 'buttonDropdown' },
                                {
                                  tag: 'div',
                                  class: 'buttonDeleteGoTo hidden',
                                  html: SVG.getBlackCloseOutIcon(),
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                    {
                      tag: 'div',
                      class: 'goToDropDownMenu hideScrollBar',
                      click: function (e) {
                        // e.preventDefault();
                        // e.stopPropagation();
                      },
                    },
                  ],
                },
              ],
            },

            {
              tag: 'div',
              class: 'buttonAddSubQuestion',
              click: function () {
                // let sub_question_buttons = $(single_answer.edit_question_DOM).find(".buttonAddSubQuestion");
                // let index = $.inArray($(this)[0], sub_question_buttons);

                single_answer.new_sub_question_index = -1;
                single_answer.getSubQuestionForm(-1, true);
              },
              children: [
                { tag: 'p', class: 'subQuestionLabel', html: 'Sub Question' },
                { tag: 'button', class: 'buttonAddSubQuestionIcon', label: SVG.getPlusSign() },
              ],
            },
            {
              tag: 'div',
              class: 'buttonDeleteSubQuestion hidden',
              click: function () {
                single_answer.deleteSubQuestion(this);
              },
              children: [
                { tag: 'p', class: 'subQuestionLabel', html: 'Sub Question' },
                { tag: 'button', class: 'buttonDeleteSubQuestionIcon', label: SVG.getBlackCloseOutIcon() },
              ],
            },
          ],
        },

        {
          tag: 'div',
          class: 'optionValueWrapper',
          children: [
            {
              tag: 'input',
              class: 'optionValueField',
              value: Utils.formatVariableName(single_answer.decline.label),
              keydown: function (e) {
                // if (!Utils.charWhitelist.includes(e.which) || e.shiftKey) e.preventDefault();
              },
              blur: function () {
                single_answer.decline.value = $(this).val().trim();
                parent_template.save();
              },
              keyup: function () {
                let input = $(this);
                if (parent_template.update_timer) clearTimeout(parent_template.update_timer);
                let value = $(input).val().trim();
                parent_template.update_timer = setTimeout(function () {
                  single_answer.decline.value = Utils.formatVariableName(value);
                  single_answer.metadata.decline.value = single_answer.decline.value;
                  $(input).val(single_answer.decline.value);
                  single_answer.inspectErrors();
                }, 450);
              },
            },
          ],
        },
      ],
    });

    let shape_class = single_answer.mode === 'menu' ? 'questionOptionShape hidden' : 'questionOptionShape';

    let view_mode_answer = DOM.new({
      tag: 'tr',
      class: view_class,
      children: [
        {
          tag: 'td',
          children: [{ tag: 'div', class: shape_class }],
        },
        {
          tag: 'td',
          children: [{ tag: 'p', class: 'questionnaireQuestion', html: single_answer.decline.label }],
        },
        {
          tag: 'td',
          children: [{ tag: 'p', class: 'goto-label' }],
        },
      ],
    });

    if (single_answer.is_sub_question) {
      $(new_answer).insertAfter(
        $(this.edit_question_DOM).children('.sub-question-edit-field-container').find('.subQuestionOption').last()
      );
      $(view_mode_answer).appendTo($(this.view_question_DOM).find('.subQuestionOptions'));

      //sub question decline option does not get sub question or go to buttons
      $(new_answer).find('.goToContainer, .buttonDeleteSubQuestion, .buttonAddSubQuestion').remove();
      // $(single_answer.edit_question_DOM).find(".addDeclineOptionWrapper").addClass("hidden");

      // $(single_answer.edit_question_DOM).find(".declineOptionWrapper").parent().addClass("hidden");
    } else {
      $(view_mode_answer).appendTo($(this.view_question_DOM).find('.dropDownViewModeContainer > .questionnaireOptions'));
      $(new_answer).insertAfter($(this.edit_question_DOM).children('.question-edit-field-container').find('.questionOption').last());

      // $(new_answer).insertAfter($(this.edit_question_DOM).find(".questionOption").last());
      // $(view_mode_answer).appendTo($(this.view_question_DOM).find(".questionnaireOptions"));

      //decline options wrapper is always last item in question div
      // $(single_answer.edit_question_DOM).find(".addDeclineOptionWrapper").addClass("hidden");
      // $(single_answer.edit_question_DOM).find(".declineOptionWrapper").last().parent().addClass("hidden");
    }

    $(single_answer.edit_question_DOM).children('.addDeclineOptionWrapper').addClass('hidden');

    if (single_answer.decline.sub_question) single_answer.createSubQuestion(single_answer.decline.sub_question, single_answer, -1);

    single_answer.parent_template.save();
  }

  //goto menu
  toggleGoToMenu(e, button, is_decline) {
    let single_answer = this;

    let parent_template = single_answer.is_sub_question ? single_answer.parent_question.parent_template : single_answer.parent_template;

    if ($(e.target).hasClass('disabledClickable') || $(e.target).hasClass('goToDropDownMenu')) return;

    if (!Questionnaires.go_to_menu_open) {
      //only add scroll padding for non-Safari browsers

      if ($.browser.win) $('#questionnaire-view-template').addClass('noScroll scrollBarPaddingRight');
      single_answer.parent_template.updateItemCount();

      $.each($('#select-goto-scroll-bar').find('.sectionScrollIcon'), function (index, value) {
        let order = index + 1;
        if (order <= single_answer.parent_template.getCurrentSection().num) {
          $(value).addClass('disabled');
        } else {
          $(value).removeClass('disabled');
        }
      });

      $.each($('#select-goto-scroll-bar').find('.questionScrollIcon'), function (index, value) {
        if (index + 1 <= single_answer.template_question_num) {
          $(value).addClass('disabled');
        } else {
          $(value).removeClass('disabled');
        }
      });

      $('#questionnaire-view-template').find('.goToMenuButton').removeClass('moveToFront');
      $(button).addClass('moveToFront');
      $('#questionnaire-modal').addClass('scrollBarMargin');
      $('#select-goto-scroll-bar').removeClass('hidden');

      let answer_index = $.inArray($(button)[0], $('#questionnaire-view-template').find('.goToMenuButton'));

      $('#question-scroll-bar').addClass('hidden');
      $('#questionnaire-viewer')
        .find('.modalMessage')
        .css('top', $(button).offset().top - 55);
      $('#questionnaire-modal, .modalMessage').fadeIn(300);
      $(button).find('.buttonDeleteGoTo').removeClass('hidden');
      $(button).find('.buttonDeleteGoTo').unbind();
      $(button)
        .find('.buttonDeleteGoTo')
        .click(function (e) {
          e.stopPropagation();

          if (!single_answer.parent_template.delete_goto_form) {
            //delete questionnaire form
            single_answer.parent_template.delete_goto_form = DOM.new({
              tag: 'div',
              class: 'deleteGoToForm',
              parent: Content.div,
              children: [
                {
                  tag: 'div',
                  class: 'containerBottomBar hideScrollBar',
                  style: 'overflow-y: visible',
                  children: [
                    { tag: 'p', class: 'formTitle', html: 'Delete Go To?' },
                    {
                      tag: 'div',
                      class: 'wrapperNoPad centerText',
                      children: [{ tag: 'p', class: 'formText inline' }],
                    },
                    {
                      tag: 'div',
                      class: 'questionReorderControlBar',
                      children: [
                        {
                          tag: 'button',
                          label: 'Cancel',
                          class: 'buttonCancelForm',
                          up_action: function (e) {
                            e.stopPropagation();
                            $('#modal-secondary').fadeOut(300);
                            $(single_answer.parent_template.delete_goto_form).fadeOut(300);
                          },
                        },
                        { tag: 'button', label: 'Delete Go To', class: 'buttonDeleteSection' },
                      ],
                    },
                  ],
                },
              ],
            });
          }

          $(single_answer.parent_template.delete_goto_form).fadeIn(300);
          $('#modal-secondary').fadeIn(300);

          let delete_snippet =
            single_answer.options[answer_index].label.length > 30
              ? single_answer.options[answer_index].label.substring(0, 30) + '...'
              : single_answer.options[answer_index].label;

          //add label
          let form_text = "Delete the go to question for answer '<b>" + delete_snippet + "</b>'?";
          $(single_answer.parent_template.delete_goto_form).find('p.formText').html(form_text);

          //bind delete action for specific answer
          $(single_answer.parent_template.delete_goto_form)
            .find('.buttonDeleteSection')
            .click(function () {
              single_answer.options[answer_index].go_to = null;
              $($(single_answer.view_question_DOM).find('p.goto-label')[answer_index]).html('');
              $(button).find('p.menuButtonLabel').html('Go To');
              $(button).parent().removeClass('redText');
              $(single_answer.scroll_icon).removeClass('questionError');
              $(single_answer.scroll_icon).find('img').attr('src', single_answer.scroll_icon_src);
              $(single_answer.parent_template.delete_goto_form).fadeOut(300);
              $('#modal-secondary').fadeOut(300);
              single_answer.inspectErrors();
            });
        });

      if (is_decline) {
        //bind select scroll bar to specific question
        $('#select-goto-scroll-bar').find('.questionScrollIcon, .sectionScrollIcon').unbind();
        $('#select-goto-scroll-bar')
          .find('.questionScrollIcon')
          .click(function (e) {
            if (!$(e.target).hasClass('disabled')) {
              let num = $(this).children('p').html().replace('S', '').replace('Q', '');
              let question = single_answer.parent_template.question_map[num];
              if (question) single_answer.decline.go_to = question.id;

              $(
                $(single_answer.view_question_DOM)
                  .find('.questionnaireOptions')
                  .children('.declineOption')
                  .children('td')
                  .children('p.goto-label')
              ).html('Go to Q' + num);
              $(button)
                .find('p.menuButtonLabel')
                .html('Q' + question.template_question_num);
              $(question.scroll_icon).removeClass('questionError');
              $(button).parent().removeClass('redText');
              single_answer.inspectErrors();
            }
          });

        $('#select-goto-scroll-bar')
          .find('.sectionScrollIcon')
          .click(function () {
            if (!$(e.target).hasClass('disabled')) {
              let num = $(this).html().replace('S', '').replace('Q', '');
              let section = single_answer.parent_template.sections[num - 1];
              single_answer.decline.go_to = section.id;
              $(button)
                .find('p.menuButtonLabel')
                .html('S' + num);
              $(
                $(single_answer.view_question_DOM)
                  .find('.questionnaireOptions')
                  .children('.declineOption')
                  .children('td')
                  .children('p.goto-label')
              ).html('Go to S' + num);
              $(button).parent().removeClass('redText');
              $(single_answer.scroll_icon).removeClass('questionError');
              single_answer.inspectErrors();
            }
          });

        $('#select-goto-scroll-bar')
          .find('.endIcon')
          .click(function () {
            if (!$(e.target).hasClass('disabled')) {
              single_answer.decline.go_to = parent_template.end_uuid;
              $(button).find('p.menuButtonLabel').html('End');
              $(button).parent().removeClass('redText');
              $(single_answer.scroll_icon).removeClass('questionError');
              $(
                $(single_answer.view_question_DOM)
                  .find('.questionnaireOptions')
                  .children('.declineOption')
                  .children('td')
                  .children('p.goto-label')
              ).html('Go to End');
              single_answer.inspectErrors();
            }
          });

        if (!single_answer.decline.go_to) {
          $(button).find('.buttonDeleteGoTo').addClass('hidden');
          $(button).find('.buttonDropdown').removeClass('hidden');
        } else {
          $(button).find('.buttonDropdown').addClass('hidden');
          $(button).find('.buttonDeleteGoTo').removeClass('hidden');
        }
      } else {
        //bind select scroll bar to specific question
        $('#select-goto-scroll-bar').find('.questionScrollIcon, .sectionScrollIcon, .endIcon').unbind();
        $('#select-goto-scroll-bar')
          .find('.questionScrollIcon')
          .click(function (e) {
            if (!$(e.target).hasClass('disabled')) {
              let num = $(this).children('p').html().replace('S', '').replace('Q', '');
              let question = single_answer.parent_template.question_map[num];
              if (question) single_answer.options[answer_index].go_to = question.id;
              $(button)
                .find('p.menuButtonLabel')
                .html('Q' + question.template_question_num);
              $(question.scroll_icon).removeClass('questionError');
              $(button).parent().removeClass('redText');
              $($(single_answer.view_question_DOM).find('p.goto-label')[answer_index]).html(
                'Go to Q' + question.template_question_num
              );
              single_answer.inspectErrors();
            }
          });

        $('#select-goto-scroll-bar')
          .find('.sectionScrollIcon')
          .click(function () {
            if (!$(e.target).hasClass('disabled')) {
              let num = $(this).html().replace('S', '').replace('Q', '');
              let section = single_answer.parent_template.sections[num - 1];
              single_answer.options[answer_index].go_to = section.id;
              $(button)
                .find('p.menuButtonLabel')
                .html('S' + num);
              $(button).parent().removeClass('redText');
              $(single_answer.scroll_icon).removeClass('questionError');
              $($(single_answer.view_question_DOM).find('p.goto-label')[answer_index]).html('Go to S' + num);
              single_answer.inspectErrors();
            }
          });

        $('#select-goto-scroll-bar')
          .find('.endIcon')
          .click(function () {
            if (!$(e.target).hasClass('disabled')) {
              single_answer.options[answer_index].go_to = parent_template.end_uuid;
              $(button).find('p.menuButtonLabel').html('End');
              $(button).parent().removeClass('redText');
              $(single_answer.scroll_icon).removeClass('questionError');
              $($(single_answer.view_question_DOM).find('p.goto-label')[answer_index]).html('Go to End');
              single_answer.inspectErrors();
            }
          });

        if (!single_answer.options[answer_index].go_to) {
          $(button).find('.buttonDeleteGoTo').addClass('hidden');
          $(button).find('.buttonDropdown').removeClass('hidden');
        } else {
          $(button).find('.buttonDropdown').addClass('hidden');
          $(button).find('.buttonDeleteGoTo').removeClass('hidden');
        }
      }

      Questionnaires.go_to_menu_open = true;
    } else {
      //close go to windows

      if ($.browser.win) $('#questionnaire-view-template').removeClass('noScroll scrollBarPaddingRight');

      setTimeout(function () {
        $('#questionnaire-view-template').find('.goToMenuButton').removeClass('moveToFront');
        $('#questionnaire-modal').removeClass('scrollBarMargin');
      }, 200);

      $('#select-goto-scroll-bar').addClass('hidden');
      $('#question-scroll-bar').removeClass('hidden');
      $(button).find('.buttonDeleteGoTo').addClass('hidden');

      $(button).find('.buttonDropdown').removeClass('hidden');
      $('#questionnaire-modal, .modalMessage').fadeOut(300);
      Questionnaires.go_to_menu_open = false;
    }
  }
  toggleGoToDeclineMenu(e, button) {
    let single_answer = this;

    if ($(e.target).hasClass('disabledClickable') || $(e.target).hasClass('goToDropDownMenu')) return;

    if (!Questionnaires.go_to_menu_open) {
      //only add scroll padding for non-Safari browsers

      if ($.browser.win) $('#questionnaire-view-template').addClass('noScroll scrollBarPaddingRight');

      single_answer.parent_template.updateItemCount();

      $.each($('#select-goto-scroll-bar').find('.sectionScrollIcon'), function (index, value) {
        let order = index + 1;
        if (order <= single_answer.parent_template.getCurrentSection().num) {
          $(value).addClass('disabled');
        } else {
          $(value).removeClass('disabled');
        }
      });

      $.each($('#select-goto-scroll-bar').find('.questionScrollIcon'), function (index, value) {
        if (index + 1 <= single_answer.template_question_num) {
          $(value).addClass('disabled');
        } else {
          $(value).removeClass('disabled');
        }
      });

      $('#questionnaire-view-template').find('.goToMenuButton').removeClass('moveToFront');
      $(button).addClass('moveToFront');
      $('#questionnaire-modal').addClass('scrollBarMargin');
      $('#select-goto-scroll-bar').removeClass('hidden');

      let answer_index = $.inArray($(button)[0], $('#questionnaire-view-template').find('.goToMenuButton'));

      //bind select scroll bar to specific question
      $('#select-goto-scroll-bar').find('.questionScrollIcon, .sectionScrollIcon').unbind();
      $('#select-goto-scroll-bar')
        .find('.questionScrollIcon')
        .click(function (e) {
          if (!$(e.target).hasClass('disabled')) {
            let num = $(this).children('p').html().replace('S', '').replace('Q', '');
            let question = single_answer.parent_template.question_map[num];
            if (question) single_answer.decline.go_to = question.id;
            $(button)
              .find('p.menuButtonLabel')
              .html('Q' + question.template_question_num);
            $(question.scroll_icon).removeClass('questionError');
            $(button).parent().removeClass('redText');
            single_answer.inspectErrors();
          }
        });

      $('#select-goto-scroll-bar')
        .find('.sectionScrollIcon')
        .click(function () {
          if (!$(e.target).hasClass('disabled')) {
            let num = $(this).html().replace('S', '').replace('Q', '');
            let section = single_answer.parent_template.sections[num - 1];
            single_answer.decline.go_to = section.id;
            $(button)
              .find('p.menuButtonLabel')
              .html('S' + num);
            $(button).parent().removeClass('redText');
            $(single_answer.scroll_icon).removeClass('questionError');
            single_answer.inspectErrors();
          }
        });

      $('#question-scroll-bar').addClass('hidden');
      $('#questionnaire-viewer')
        .find('.modalMessage')
        .css('top', $(button).offset().top - 55);
      $('#questionnaire-modal, .modalMessage').fadeIn(300);
      $(button).find('.buttonDeleteGoTo').removeClass('hidden');
      $(button).find('.buttonDeleteGoTo').unbind();
      $(button)
        .find('.buttonDeleteGoTo')
        .click(function (e) {
          e.stopPropagation();

          if (!single_answer.parent_template.delete_goto_form) {
            //delete questionnaire form
            single_answer.parent_template.delete_goto_form = DOM.new({
              tag: 'div',
              class: 'deleteGoToForm',
              parent: Content.div,
              children: [
                {
                  tag: 'div',
                  class: 'containerBottomBar hideScrollBar',
                  style: 'overflow-y: visible',
                  children: [
                    { tag: 'p', class: 'formTitle', html: 'Delete Go To?' },
                    {
                      tag: 'div',
                      class: 'wrapperNoPad centerText',
                      children: [{ tag: 'p', class: 'formText inline' }],
                    },
                    {
                      tag: 'div',
                      class: 'questionReorderControlBar',
                      children: [
                        {
                          tag: 'button',
                          label: 'Cancel',
                          class: 'buttonCancelForm',
                          up_action: function (e) {
                            e.stopPropagation();
                            $('#modal-secondary').fadeOut(300);
                            $(single_answer.parent_template.delete_goto_form).fadeOut(300);
                          },
                        },
                        { tag: 'button', label: 'Delete Go To', class: 'buttonDeleteSection' },
                      ],
                    },
                  ],
                },
              ],
            });
          }

          $(single_answer.parent_template.delete_goto_form).fadeIn(300);
          $('#modal-secondary').fadeIn(300);

          //add label
          $(single_answer.parent_template.delete_goto_form)
            .find('p.formText')
            .html("Delete the go to question for answer '<b>" + single_answer.options[answer_index].label + "</b>'?");
          //bind delete action for specific answer
          $(single_answer.parent_template.delete_goto_form)
            .find('.buttonDeleteSection')
            .click(function () {
              single_answer.decline.go_to = null;
              $(button).find('p.menuButtonLabel').html('Go To');
              $(button).parent().removeClass('redText');
              $(single_answer.scroll_icon).removeClass('questionError');
              $(single_answer.scroll_icon).find('img').attr('src', single_answer.scroll_icon_src);
              $(single_answer.parent_template.delete_goto_form).fadeOut(300);
              $('#modal-secondary').fadeOut(300);
              single_answer.parent_template.save();
            });
        });

      if (!single_answer.decline.go_to) {
        $(button).find('.buttonDeleteGoTo').addClass('hidden');
        $(button).find('.buttonDropdown').removeClass('hidden');
      } else {
        $(button).find('.buttonDropdown').addClass('hidden');
        $(button).find('.buttonDeleteGoTo').removeClass('hidden');
      }

      Questionnaires.go_to_menu_open = true;
    } else {
      //close go to windows

      if ($.browser.win) $('#questionnaire-view-template').removeClass('noScroll scrollBarPaddingRight');

      setTimeout(function () {
        $('#questionnaire-view-template').find('.goToMenuButton').removeClass('moveToFront');
        $('#questionnaire-modal').removeClass('scrollBarMargin');
      }, 200);

      $('#select-goto-scroll-bar').addClass('hidden');
      $('#question-scroll-bar').removeClass('hidden');
      $(button).find('.buttonDeleteGoTo').addClass('hidden');

      $(button).find('.buttonDropdown').removeClass('hidden');
      $('#questionnaire-modal, .modalMessage').fadeOut(300);
      Questionnaires.go_to_menu_open = false;
    }
  }

  //error inspection
  inspectTextErrors() {
    //checks for empty text fields

    let error = super.inspectTextErrors();

    //
    let single_option = this;
    //
    // //if this is a sub question, call method from parent question instead
    //
    // // this.updateError(false);
    //
    let option_class = single_option.is_sub_question ? 'subQuestionOption' : 'questionOption';
    //
    super.setTextAreaHeight();
    //
    // let error = false;
    //
    // let question_label = $(single_option.edit_question_DOM).children(".wrapper").children(".questionField");
    //
    // if (!question_label.val()) {
    //
    //     $(question_label).addClass("questionError");
    //     $(single_option.view_question_DOM).children("p.questionText").html(Questionnaires2.NO_QUESTION_TEXT).addClass("redText");
    //     error = true;
    //
    // } else {
    //
    //     $(single_option.view_question_DOM).children("p.questionText").removeClass("redText");
    //     $(question_label).removeClass("questionError");
    // }

    //check for empty options
    $.each(
      $(single_option.edit_question_DOM)
        .children('.' + option_class)
        .not('.declineOption'),
      function (index, value) {
        let label_field = $(value).children('.questionOptionWrapper').children('.optionField');

        if (!$(label_field).val()) {
          error = true;
          $(label_field).addClass('questionError');
        } else {
          $(label_field).removeClass('questionError');
        }
      }
    );

    //check for empty decline option
    let decline_field = $(single_option.edit_question_DOM)
      .children('.declineOption')
      .children('.declineOptionWrapper')
      .children('.optionField');
    if (decline_field.length) {
      if (!$(decline_field).val()) {
        error = true;
        $(decline_field).addClass('questionError');
      } else {
        $(decline_field).removeClass('questionError');
      }
    }

    //update UI in view mode with placeholder text for missing values
    $.each(
      $(single_option.view_question_DOM).find('p').not('p.headingText, p.instructionText, p.goto-label, p.editFieldLabel'),
      function (index, value) {
        if (!$(value).html()) {
          let placeholder = Questionnaires.NO_QUESTION_TEXT;
          if ($(value).hasClass('questionnaireQuestion')) placeholder = Questionnaires.NO_ANSWER_TEXT;
          $(value).html(placeholder);
          $(value).addClass('redText');
        } else {
          $(value).removeClass('redText');
          $(value).removeClass('hidden');
        }
      }
    );

    $.each($(single_option.view_question_DOM).find('p.instructionText'), function (index, value) {
      if (!$(value).html()) {
        $(value).addClass('hidden');
      } else {
        $(value).removeClass('hidden');
      }
    });

    //check sub questions
    for (let option of single_option.options) {
      if (option.sub_question) {
        let sub_question = single_option.parent_template.getItemById(option.sub_question.id);
        if (sub_question)
          if (sub_question.inspectErrors()) {
            error = true;
          }
      }
    }

    // if (error) error = "invalid_Q" + this.template_question_num;
    return error;

    //after adding errors from sub questions, add error from parent question if there is one
    // if (error) this.updateError(true);
    // single_option.parent_template.save();
  }
  inspectGoTos() {
    //returns boolean for invalid gotos for question
    //updates invalid goto UI elements
    //a goto is invalid if it points to a question or section that is NOT AFTER the given question or section

    let question = this;
    let template = question.is_sub_question ? question.parent_question.parent_template : question.parent_template;
    let error = false;

    // update invalid go tos
    if (question.options) {
      for (let i = 0; i < question.options.length; i++) {
        let goto = question.options[i].go_to;

        //check if go to is a section or question
        if (goto) {
          if (goto === template.end_uuid) {
            $($(question.edit_question_DOM).find('.goToContainer')[i]).find('p.menuButtonLabel').html('End');
            $($(question.edit_question_DOM).find('.goToContainer')[i]).removeClass('redText');
            $($(question.view_question_DOM).find('.goto-label')[i]).html('Go to End').removeClass('redText');
            continue;
          }

          let goto_obj;
          let goto_label;

          //if a question
          if (this.parent_template.question_id_map[goto]) {
            goto_obj = this.parent_template.question_id_map[goto];
            goto_label = 'Go to Q' + goto_obj.template_question_num;
            $($(question.edit_question_DOM).find('.goToContainer')[i])
              .find('p.menuButtonLabel')
              .html('Q' + goto_obj.template_question_num);

            if (goto_obj.template_question_num <= question.template_question_num) {
              $($(question.edit_question_DOM).find('.goToContainer')[i]).addClass('redText');
              $($(question.view_question_DOM).find('p.goto-label')[i]).addClass('redText');
              error = true;
            } else {
              $($(question.view_question_DOM).find('p.goto-label')[i]).removeClass('redText');
              $($(question.edit_question_DOM).find('.goToContainer')[i]).removeClass('redText');
            }
          }

          //if a section
          if (this.parent_template.section_id_map[goto]) {
            goto_obj = this.parent_template.section_id_map[goto];
            goto_label = 'Go to S' + goto_obj.num;
            $($(question.edit_question_DOM).find('.goToContainer')[i])
              .find('p.menuButtonLabel')
              .html('S' + goto_obj.num);

            if (goto_obj.num <= question.section.num) {
              $($(question.view_question_DOM).find('p.goto-label')[i]).addClass('redText');
              $($(question.edit_question_DOM).find('.goToContainer')[i]).addClass('redText');
              error = true;
            } else {
              $($(question.view_question_DOM).find('p.goto-label')[i]).removeClass('redText');
              $($(question.edit_question_DOM).find('.goToContainer')[i]).removeClass('redText');
            }
          }

          $($(question.view_question_DOM).find('.goto-label')[i]).html(goto_label).removeClass('hidden');
        }
      }

      if (question.decline) {
        let goto = question.decline.go_to;

        //check if go to is a section or question
        if (goto) {
          let goto_obj;

          //if a question
          if (this.parent_template.question_id_map[goto]) {
            goto_obj = this.parent_template.question_id_map[goto];

            let decline_edit_row = $($(question.edit_question_DOM).find('.declineOption.questionOption'));

            $(decline_edit_row)
              .find('p.menuButtonLabel')
              .html('Q' + goto_obj.template_question_num);
            $($(question.view_question_DOM).find('.goto-label'))
              .last()
              .html('Go to Q' + goto_obj.template_question_num);

            if (goto_obj.template_question_num <= question.template_question_num) {
              $($(question.edit_question_DOM).find('.goToContainer').last()).addClass('redText');
              $($(question.view_question_DOM).find('p.goto-label').last()).addClass('redText');
              error = true;
            } else {
              $($(question.view_question_DOM).find('p.goto-label').last()).removeClass('redText');
              $($(question.edit_question_DOM).find('.goToContainer').last()).removeClass('redText');
            }
          }

          //if a section
          if (this.parent_template.section_id_map[goto]) {
            goto_obj = this.parent_template.section_id_map[goto];

            let decline_edit_row = $($(question.edit_question_DOM).find('.declineOption.questionOption'));
            $(decline_edit_row)
              .find('p.menuButtonLabel')
              .html('S' + goto_obj.num);
            $($(question.view_question_DOM).find('.goto-label'))
              .last()
              .html('Go to S' + goto_obj.num);

            if (goto_obj.num <= question.section.num) {
              $($(question.view_question_DOM).find('p.goto-label').last()).addClass('redText');
              $(decline_edit_row).find('.goToContainer').addClass('redText');
              error = true;
            } else {
              $($(question.view_question_DOM).find('p.goto-label').last()).removeClass('redText');
              $(decline_edit_row).find('.goToContainer').removeClass('redText');
            }
          }

          if (goto === template.end_uuid) {
            let decline_edit_row = $($(question.edit_question_DOM).find('.declineOption.questionOption'));
            $(decline_edit_row).find('p.menuButtonLabel').html('End');
            $($(question.view_question_DOM).find('.goto-label')).last().html('Go to End');
          }
        }
      }
    }

    // if (error) this.updateError(true);
    // this.parent_template.save();
    // if (error) error = "invalid_branching"

    // if (error) {
    //     if (!question.parent_template.error) question.parent_template.error = [];
    //     question.parent_template.error.push("invalid_branching")
    // }
    return error;
  }
  inspectErrors() {
    //master error function that determines if question is considered an error

    //inspect fields
    let field_error = this.inspectTextErrors();
    let goto_error = this.inspectGoTos();
    let error = field_error || goto_error;

    if (field_error || goto_error) {
      // console.log(field_error + " field error");
      // console.log(goto_error + " goto error");
    }

    //don't update question error if a subquestion
    //simply pass error boolean up to parent question, which then sets the error
    if (this.is_sub_question) return error;
    this.updateError(error);
  }

  //response values for assets
  getResponse(viewer_option) {
    let question = this;
    let response = null;

    if (question.hasOwnProperty('responseIndexes')) {
      if (question.responseIndexes != null) {
        if (question.responseIndexes.length) {
          //index of selected option
          let index = question.responseIndexes[0];

          //if index is equal to length of options array, assume decline option was selected
          if (index > -1) {
            if (index === question.options.length) {
              response = question.decline.label;
              if (viewer_option) if (viewer_option === 'variable') response = question.decline.value;
            } else {
              response = question.options[question.responseIndexes[0]].label;
              if (viewer_option)
                if (viewer_option === 'variable') response = question.options[question.responseIndexes[0]].value;
            }
          }
        }
      }
    }

    return response ? response : '';
  }
  drawEditableResponse(container) {
    super.drawEditableResponse();

    let question = this;
    let parent_template = this.parent_template;
    let view = $(question.asset_edit_view);

    if (question.mode === 'menu') {
      if (!$(view).find('.single-select-dropdown-menu').length) {
        let list_items = [];

        for (let option of question.options) {
          list_items.push({
            tag: 'div',
            class: 'single-select-dropdown-list-item',
            children: [{ tag: 'p', class: 'single-select-dropdown-list-item-label', html: option.label }],
            click: function () {
              $(view).find('.single-select-dropdown-list-item').removeClass('active');
              $(this).addClass('active');

              question.responseIndexes = [$.inArray(option, question.options)];
              $(view).find('.single-select-dropdown-selector > p.single-select-dropdown-list-item-label').html(option.label);
              $(view).find('.single-select-dropdown-menu').addClass('hidden');
            },
          });
        }

        view.find('.dropDownViewModeContainer').remove();
        DOM.new({
          tag: 'div',
          class: 'single-select-dropdown-selector',
          children: [
            { tag: 'p', class: 'single-select-dropdown-list-item-label', html: question.getResponse() },
            { tag: 'div', class: 'buttonQuestionnaireDropDown' },
          ],
          parent: view,
          click: function (e) {
            e.stopPropagation();
            $(view).find('.single-select-dropdown-menu').toggleClass('hidden');
          },
        });
        DOM.new({ tag: 'div', class: 'single-select-dropdown-menu hidden', children: list_items, parent: view });
      }
    }

    // let selector_class = (this.is_sub_question) ? ".subQuestionOptions .questionOptionShape" : ".questionnaireOptions .questionOptionShape";
    let selector_class = question.is_sub_question
      ? 'tr.questionnaireSubOption td > .questionOptionShape'
      : 'tr.questionOption td > .questionOptionShape';

    // let selector_class = (question.is_sub_question) ? ".questionnaireSubOption .questionOptionShape" : ".questionnaireOptions td > .questionOptionShape";
    let options = $(view).find(selector_class);
    console.log(options);

    $(view)
      .find(selector_class)
      .click(function () {
        $(view)
          .find(selector_class + '.optionSelected')
          .removeClass('optionSelected');
        $(this).addClass('optionSelected');
        question.responseIndexes = [$.inArray(this, options)];
      });

    if (question.responseIndexes) {
      for (let index of question.responseIndexes) {
        $($(view).find(selector_class)[index]).addClass('optionSelected');
      }
    }

    if (!this.is_sub_question) {
      // sub questions
      for (let option of question.options) {
        if (option.sub_question) {
          let sub_question = parent_template.getItemById(option.sub_question.id);
          sub_question.drawEditableResponse(container);
        }
      }
      $(view).appendTo(container);
    }
  }
  drawViewResponse(container) {
    super.drawViewResponse();

    let question = this;
    let view = $(question.asset_view_view);
    let parent_template = question.parent_template;

    if (question.mode === 'menu') {
      if (!$(view).find('.single-select-dropdown-menu').length) {
        let list_items = [];

        for (let option of question.options) {
          list_items.push({
            tag: 'div',
            class: 'single-select-dropdown-list-item',
            children: [{ tag: 'p', class: 'single-select-dropdown-list-item-label', html: option.label }],
            click: function () {
              $(view).find('.single-select-dropdown-list-item').removeClass('active');
              $(this).addClass('active');

              question.responseIndexes = [$.inArray(option, question.options)];
              $(view).find('.single-select-dropdown-selector > p.single-select-dropdown-list-item-label').html(option.label);
              $(view).find('.single-select-dropdown-menu').addClass('hidden');
            },
          });
        }

        view.find('.dropDownViewModeContainer').remove();

        DOM.new({
          tag: 'div',
          class: 'single-select-dropdown-selector',
          children: [
            { tag: 'p', class: 'single-select-dropdown-list-item-label', html: question.getResponse() },
            { tag: 'div', class: 'buttonQuestionnaireDropDown' },
          ],
          parent: view,
          click: function (e) {
            e.stopPropagation();
            $(view).find('.single-select-dropdown-menu').toggleClass('hidden');
          },
        });
        DOM.new({ tag: 'div', class: 'single-select-dropdown-menu hidden', children: list_items, parent: view });
      }
    }

    let selector_class = question.is_sub_question
      ? 'tr.questionnaireSubOption td > .questionOptionShape'
      : 'tr.questionOption td > .questionOptionShape';
    let options = $(view).find(selector_class);

    if (question.is_sub_question) {
      console.log(options);
    }

    if (question.responseIndexes) {
      for (let index of question.responseIndexes) {
        $($(view).find(selector_class)[index]).addClass('optionSelected');
        $(view).find(selector_class);
      }
    }

    if (!question.is_sub_question) {
      // sub questions
      for (let option of question.options) {
        if (option.sub_question) {
          let sub_question = parent_template.getItemById(option.sub_question.id);
          sub_question.drawViewResponse(view);
        }
      }
      $(view).appendTo(container);
    } else {
      // remove sub questions because we will re-add them with completed answers
      let option_element = $(container).find('tr.questionOption')[question.answer_index];

      console.log(question);

      console.log($(container).find('tr.questionOption'));
      console.log($(option_element).next());

      if ($(option_element).next().hasClass('subQuestion')) $(option_element).next().remove();
      $(view).insertAfter($(option_element));
    }

    if (question.hasOwnProperty('assetUuids')) {
      if (question.assetUuids) {
        if (question.assetUuids.length) {
          for (let uuid of question.assetUuids) {
            let asset = Assets.getAsset(uuid);

            // todo write parameters function to provide host and protocol
            let url =
              Parameters.deployment === 'live'
                ? 'https://rapid.apl.uw.edu' + asset.file_url
                : 'https://rapid2.apl.uw.edu' + asset.file_url;

            DOM.new({
              tag: 'img',
              class: 'embeddedAssetViewImg',
              src: url,
              parent: container,
              children: [
                {
                  tag: 'button',
                  class: 'view-embedded-asset-icon',
                  label: SVG.getEyeIcon(),
                  style: ['buttonEditItems', 'margin10'],
                  up_action: function () {
                    parent_template.getEmbeddedAssetViewer(question.id, uuid, 'map-container');
                  },
                },
              ],
              click: function () {
                // check for map view embedded asset element
                if ($('#map-info-panel .embeddedAssetViewImg').length) {
                  parent_template.getEmbeddedAssetViewer(question.id, uuid, 'map-container');
                }
              },
            });
          }
        }
      }
    }
  }
  getAssetViewerTableCell() {
    let question = this;

    let questionnaire = this.parent_template;

    function embedded_asset_element(uuid) {
      let asset = Assets.getAsset(uuid);

      let asset_label = asset.title != null ? asset.title : asset.type.toUpperCase();

      let filename = asset_label + '.' + asset.format.toLowerCase();

      return {
        tag: 'div',
        class: 'embeddedAssetRow',
        children: [
          { tag: 'img', class: 'embeddedAsset', src: asset.file_url },
          { tag: 'p', class: 'embeddedAssetCellLabel', html: "View '<b>" + filename + '</b>' },
        ],
        click: function () {
          questionnaire.getEmbeddedAssetViewer(question.id, uuid, 'questionnaire-viewer-container');
        },
        mouseover: function (e) {
          e.stopPropagation();
          e.stopImmediatePropagation();
          clearTimeout(questionnaire.questionnaire_asset_viewer.tooltip_timer);
          $(questionnaire.questionnaire_asset_viewer.tooltip).hide();
          $(this).parent().removeClass('tooltip-visible');
        },
        mouseleave: function () {
          $(this).removeClass('embedded-asset-selected');
        },
      };
    }

    function generate_question_cell(response, allow_embedded_assets) {
      let cell_children = [
        {
          tag: 'button',
          label: SVG.getPencilSmall(),
          style: ['buttonEditItems', 'button-edit-question'],
          up_action: function () {
            questionnaire.editCompletedQuestionnaire(question.id);
          },
        },
        { tag: 'div', children: [{ tag: 'p', html: response }] },
      ];

      // no embedded assets for sub questions at this time
      if (allow_embedded_assets) {
        if (question.hasOwnProperty('assetUuids')) {
          if (question.assetUuids.length) {
            for (let uuid of question.assetUuids) cell_children.push(embedded_asset_element(uuid));
          }
        }
      }
      return { tag: 'td', class: 'multi-text-cell', children: cell_children };
    }

    let cell = generate_question_cell(question.getResponse(Assets.viewerOptions.responses), true);

    questionnaire.table_cells.push(cell);

    for (let option of question.options) {
      // sub questions need to be added to their own table cell
      if (option.sub_question) {
        let sub_question = questionnaire.getItemById(option.sub_question.id);
        if (option.sub_question.questions) {
          // add text fields if sub question a multi text

          let responses = sub_question.getResponse();
          for (let response of responses) questionnaire.table_cells.push(generate_question_cell(response, false));
          continue;
        }

        let label = sub_question ? sub_question.getResponse(Assets.viewerOptions.responses) : 'sub question';
        questionnaire.table_cells.push(generate_question_cell(label, false));
      }
    }
  }
}
class MultiAnswer2 extends SingleAnswer2 {
  constructor(metadata, parent_template, question_num, template_question_num, section, is_new, parent_question, answer_index) {
    super(metadata, parent_template, question_num, template_question_num, section, is_new, parent_question, answer_index);

    this.scroll_icon_src = 'lib/images/icons/icon-multi_select-46x46.png';
    this.scroll_icon_error_src = 'lib/images/icons/icon-multi_select-error-46x46.png';
    $(this.scroll_icon).find('img').attr('src', this.scroll_icon_src);
    $(this.reorder_list_item).find('img').attr('src', this.scroll_icon_src);
    $(this.edit_question_DOM).addClass('multi-select');

    this.updateView();

    // $(this.view_question_DOM).find(".questionOptionShape").addClass("answerBubbleViewMode").removeClass("questionOptionShape");
    // $(this.edit_question_DOM).find(".MultipleChoiceBubble").addClass("MultipleSelectionBubble").removeClass("MultipleChoiceBubble");

    //remove go tos for multi select questions
    $(this.edit_question_DOM).find('.goToContainer, .questionModeWrapper').remove();
    $(this.view_question_DOM).find('.dropDownViewQuestionContainer').removeClass('dropDownViewQuestionContainer');
    $(this.view_question_DOM).find('.questionnairePlaceholder').remove();
    $(this.view_question_DOM).find('.answerBubbleViewMode').show();
    $(this.view_question_DOM).find('.answerBubbleViewMode').removeClass('hidden');

    //update margin
    // $(this.view_question_DOM).find(".questionnaireQuestion").css("margin-left", "30px")
  }

  addOption() {
    super.addOption();
    this.updateView();
  }

  addDeclineOption() {
    super.addDeclineOption();
    this.updateView();
  }

  // inspectErrors() {
  //
  //     //master error function that determines if question is considered an error
  //
  //     //inspect fields
  //     let field_error = this.inspectTextErrors();
  //     if (this.is_sub_question) return error;
  //     this.updateError(field_error)
  // }

  // inspectTextErrors() {
  // }

  updateView() {
    //updates view from inherited single select template to multi select UI
    //removes go-tos and replace circles with rounded squares for answer options

    if (this.is_sub_question) {
      $(this.edit_question_DOM).find('.goToContainer, .questionModeWrapper').remove();

      $(this.view_question_DOM)
        .find('.questionOptionShape')
        .addClass('answerBubbleViewMode')
        .removeClass('questionOptionShape')
        .removeClass('hidden');
      $(this.edit_question_DOM).find('.MultipleChoiceBubble').addClass('MultipleSelectionBubble').removeClass('MultipleChoiceBubble');
    } else {
      $(this.edit_question_DOM).find('.goToContainer, .questionModeWrapper').remove();

      $(this.view_question_DOM)
        .find('.questionOptionShape')
        .not('.subQuestion .questionOptionShape')
        .addClass('answerBubbleViewMode')
        .removeClass('questionOptionShape');

      $(this.edit_question_DOM)
        .find('.MultipleChoiceBubble')
        .not('.subQuestion .MultipleChoiceBubble')
        .addClass('MultipleSelectionBubble')
        .removeClass('MultipleChoiceBubble');
    }
  }

  drawEditableResponse(container) {
    super.drawEditableResponse();

    let question = this;
    let parent_template = this.parent_template;
    let view = $(this.view_question_DOM);

    // let selector_class = (this.is_sub_question) ? ".subQuestionOptions .answerBubbleViewMode" : ".questionnaireOptions .answerBubbleViewMode";
    // let selector_class = (question.is_sub_question) ? ".questionnaireSubOption .answerBubbleViewMode" : ".questionnaireOptions td > .answerBubbleViewMode";
    let selector_class = question.is_sub_question
      ? 'tr.questionnaireSubOption td > .answerBubbleViewMode'
      : 'tr.questionOption td > .answerBubbleViewMode';

    let options = $(view).find(selector_class);
    console.log(options);

    $(view)
      .find(selector_class)
      .click(function () {
        $(view)
          .find(selector_class + '.answerBubbleViewModeSelected')
          .removeClass('answerBubbleViewModeSelected');
        $(this).addClass('answerBubbleViewModeSelected');
        question.responseIndexes = [$.inArray(this, options)];
      });

    if (question.responseIndexes) {
      for (let index of question.responseIndexes) {
        $($(view).find(selector_class)[index]).addClass('answerBubbleViewModeSelected');
      }
    }

    if (!this.is_sub_question) {
      // sub questions
      for (let option of question.options) {
        if (option.sub_question) {
          let sub_question = parent_template.getItemById(option.sub_question.id);
          sub_question.drawEditableResponse(view);
        }
      }
      $(view).appendTo(container);
    }
  }

  drawViewResponse(container) {
    super.drawViewResponse();

    let question = this;
    let view = $(question.asset_view_view);

    console.log(view);

    let parent_template = question.parent_template;
    // let selector_class = (question.is_sub_question) ? ".questionnaireSubOption .answerBubbleViewMode" : ".questionnaireOptions td > .answerBubbleViewMode";
    let selector_class = question.is_sub_question
      ? 'tr.questionnaireSubOption td > .answerBubbleViewMode'
      : 'tr.questionOption td > .answerBubbleViewMode';

    // let selector_class = (this.is_sub_question) ? ".subQuestionOptions .answerBubbleViewMode" : ".questionnaireOptions .answerBubbleViewMode";
    let options = $(view).find(selector_class);

    if (question.is_sub_question) {
      console.log(options);
    }

    $(view)
      .find(selector_class)
      .click(function () {
        $(view)
          .find(selector_class + '.answerBubbleViewModeSelected')
          .removeClass('answerBubbleViewModeSelected');
        $(this).addClass('answerBubbleViewModeSelected');
        question.responseIndexes = [$.inArray(this, options)];
      });

    if (question.responseIndexes) {
      for (let index of question.responseIndexes) {
        $($(view).find(selector_class)[index]).addClass('answerBubbleViewModeSelected');
      }
    }

    if (!question.is_sub_question) {
      // sub questions
      for (let option of question.options) {
        if (option.sub_question) {
          let sub_question = parent_template.getItemById(option.sub_question.id);
          sub_question.drawViewResponse(view);
        }
      }
      $(view).appendTo(container);
    } else {
      // remove sub questions because we will re-add them with completed answers
      let option_element = $(container).find('tr.questionOption')[question.answer_index];
      if ($(option_element).next().hasClass('subQuestion')) $(option_element).next().remove();
      $(view).insertAfter($(option_element));
    }

    // @TODO
    //  this should be a method of super class
    if (question.hasOwnProperty('assetUuids')) {
      if (question.assetUuids) {
        if (question.assetUuids.length) {
          for (let uuid of question.assetUuids) {
            let asset = Assets.getAsset(uuid);

            // todo write parameters function to provide host and protocol
            let url =
              Parameters.deployment === 'live'
                ? 'https://rapid.apl.uw.edu' + asset.file_url
                : 'https://rapid2.apl.uw.edu' + asset.file_url;

            DOM.new({
              tag: 'img',
              class: 'embeddedAssetViewImg',
              src: url,
              parent: container,
              children: [
                {
                  tag: 'button',
                  class: 'view-embedded-asset-icon',
                  label: SVG.getEyeIcon(),
                  style: ['buttonEditItems', 'margin10'],
                  up_action: function () {
                    parent_template.getEmbeddedAssetViewer(question.id, uuid, 'map-container');
                  },
                },
              ],
              click: function () {
                // check for map view embedded asset element
                if ($('#map-info-panel .embeddedAssetViewImg').length) {
                  parent_template.getEmbeddedAssetViewer(question.id, uuid, 'map-container');
                }
              },
            });
          }
        }
      }
    }
  }

  getResponse(viewer_option) {
    let response = '';
    if (this.hasOwnProperty('responseIndexes')) {
      if (this.responseIndexes != null) {
        if (this.responseIndexes.length) {
          if (this.responseIndexes[0] === this.options.length) {
            response = this.decline.label;
            return response;
          }

          response = this.options[this.responseIndexes[0]].label;

          if (this.responseIndexes.length > 1) {
            response = '';
            for (let index of this.responseIndexes) {
              if (this.options[index]) {
                if (viewer_option)
                  if (viewer_option === 'variable') {
                    response += this.options[index].value + '<br><br>';
                  } else {
                    response += this.options[index].label + '<br><br>';
                  }
              }
            }
            response = response.substring(0, response.length - 8);
          }
        }
      }
    }
    return response.length ? response : '';
  }

  // setResponse() {}
}
class YesNo2 extends SingleAnswer2 {
  constructor(metadata, parent_template, question_num, template_question_num, section, is_new, parent_question, answer_index) {
    super(metadata, parent_template, question_num, template_question_num, section, is_new, parent_question, answer_index);

    this.scroll_icon_src = 'lib/images/icons/icon-yes_no-46x46.png';
    this.scroll_icon_error_src = 'lib/images/icons/icon-yes_no-error-46x46.png';
    $(this.scroll_icon).find('img').attr('src', this.scroll_icon_src);
    $(this.reorder_list_item).find('img').attr('src', this.scroll_icon_src);

    $(this.edit_question_DOM).find('.MultipleChoiceInput').addClass('disabled');
    $(this.edit_question_DOM).find('.declineOption input').removeClass('disabled');

    $(this.edit_question_DOM).find('.answerVariableName').removeClass('disabled');
    // $(this.edit_question_DOM).find("svg.deleteItemIcon").remove();

    let remove_items = $(this.edit_question_DOM)
      .find('.questionOption, .subQuestionOption')
      .not('.questionOption.declineOption, .subQuestionOption.declineOption');
    $(remove_items).find('.removableAnswer svg.deleteItemIcon').remove();

    $(this.view_question_DOM).find('.questionType').html('Yes / No');
    $(this.edit_question_DOM).find('.questionType').html('Yes / No');

    $(this.edit_question_DOM).children('.addOptionWrapper').hide();
    $(this.branching_icon).find('img').attr('src', this.scroll_icon_src);
  }

  // setErrorStyle() {
  //
  //     // super.setErrorStyle();
  //
  //     let question = this;
  //
  //     setTimeout(function () {
  //         $(question.scroll_icon).addClass("questionError");
  //         $(question.reorder_list_item).addClass("questionError");
  //         $(question.reorder_list_item).find("img").attr("src", "lib/images/icons/icon-yes_no-error-46x46.png");
  //         $(question.scroll_icon).find("img").attr("src", "lib/images/icons/icon-yes_no-error-46x46.png");
  //         console.log(question.scroll_icon_error_src)
  //
  //     }, 1);
  //
  // }
}
class MultiText extends Question {
  constructor(metadata, parent_template, question_num, template_question_num, section, is_new, parent_question, answer_index) {
    super(metadata, parent_template, question_num, template_question_num, section, is_new, parent_question, answer_index);

    let multi_text = this;
    multi_text.answer_index = answer_index;

    multi_text.is_sub_question = false;

    delete this.required;

    this.scroll_icon_src = 'lib/images/icons/icon-text_field-46x46.png';
    this.scroll_icon_error_src = 'lib/images/icons/icon-text_field-error-46x46.png';
    $(this.scroll_icon).find('img').attr('src', this.scroll_icon_src);
    $(this.reorder_list_item).find('img').attr('src', this.scroll_icon_src);

    this.view_question_DOM = DOM.new({
      tag: 'div',
      class: 'questionWrapper viewMode',
      children: [
        { tag: 'p', class: 'questionNumber', html: 'Q' + template_question_num },
        { tag: 'p', class: 'questionType', html: 'Text Field(s)' },
        { tag: 'p', class: 'headingText', html: this.heading },
      ],
    });

    this.edit_question_DOM = DOM.new({
      tag: 'div',
      class: 'questionWrapper multiText',
      children: [
        { tag: 'p', class: 'questionNumber', html: 'Q' + template_question_num },
        multi_text.getHeadingField(),
        { tag: 'div', class: 'modeSelector', children: [{ tag: 'div', class: 'modeOption toggled', html: 'Text Field(s)' }] },
        multi_text.addFieldRow(),
        {
          tag: 'div',
          class: 'wrapperExtraTopPad',
          children: [
            {
              tag: 'button',
              class: 'buttonDeleteQuestion',
              label: 'Delete Question',
              up_action: function () {
                multi_text.getDeleteQuestionForm();
              },
            },
          ],
        },
      ],
    });

    let reorder_text = this.heading ? 'Q' + this.num + ': ' + this.heading : 'Q' + this.num + ': Multi Text';

    //list item for reorder question panel
    $(this.reorder_list_item).find('.reorderQuestionText').html(reorder_text);

    if (is_new) {
      //add new question to template
      if (!parent_template.edit_mode) parent_template.toggleView();
      let new_question = parent_template.edit_mode ? $(this.edit_question_DOM) : $(this.view_question_DOM);
      $('#questionnaire-view-template').children().not('.newQuestionModalForm').remove();
      $(new_question).appendTo($('#questionnaire-view-template'));
      $('.questionScrollIcon, .headerScrollIcon, .sectionScrollIcon, .sectionScrollContainer').removeClass('iconActive');
      $(this.scroll_icon).addClass('iconActive');
      parent_template.updateItemCount();
    } else if (parent_question) {
      multi_text.is_sub_question = true;
      this.parent_question = parent_question;

      this.edit_question_DOM = DOM.new({
        tag: 'div',
        class: 'questionWrapper multiText subQuestion',
        children: [multi_text.addFieldRow()],
      });

      this.view_question_DOM = DOM.new({ tag: 'div', class: 'questionWrapper subQuestion indent' });

      if (answer_index > -1) {
        let view_field = $(
          $(parent_question.view_question_DOM).find('.questionnaireOptions').children('.questionOption')[answer_index]
        );

        //todo verify this selector is always accurate!
        let edit_field = $(
          $(parent_question.edit_question_DOM).children('.question-edit-field-container').find('.questionOption')[answer_index]
        );

        $(this.view_question_DOM).insertAfter($(view_field));
        $(this.edit_question_DOM).appendTo($(edit_field));

        $(this.view_question_DOM).find('.questionOption').removeClass('questionOption').addClass('questionnaireSubOption');
        $(this.view_question_DOM).find('.questionnaireOptions').removeClass('questionnaireOptions').addClass('subQuestionOptions');

        $($(parent_question.edit_question_DOM).find('.buttonAddSubQuestion')[answer_index]).addClass('hidden');
        $($(parent_question.edit_question_DOM).find('.buttonDeleteSubQuestion')[answer_index]).removeClass('hidden');

        parent_question.options[answer_index].sub_question = this.metadata;
        // parent_template.updateItemCount();
      } else if (answer_index === -1) {
        this.is_decline_sub_question = true;

        parent_question.decline.sub_question = this.metadata;

        this.view_question_DOM = DOM.new({ tag: 'div', class: 'questionWrapper subQuestion indent' });

        $(this.edit_question_DOM).find('.goToMenuButton, .buttonAddSubQuestion, .buttonDeleteSubQuestion').remove();
        $(this.edit_question_DOM).find('.questionOption').removeClass('questionOption');

        let view_field = $(
          $(parent_question.view_question_DOM)
            .children('.dropDownViewModeContainer')
            .children('.questionnaireOptions')
            .children('.questionOption')
            .last()
        );
        let edit_field = $($(parent_question.edit_question_DOM).children('.declineOption'));

        $(this.view_question_DOM).insertAfter($(view_field));
        $(this.edit_question_DOM).appendTo($(edit_field));

        $(this.view_question_DOM).find('.questionOption').removeClass('questionOption').addClass('questionnaireSubOption');
        $(this.view_question_DOM).find('.questionnaireOptions').removeClass('questionnaireOptions').addClass('subQuestionOptions');

        $($(edit_field).find('.buttonAddSubQuestion')).addClass('hidden');
        $($(edit_field).find('.buttonDeleteSubQuestion')).removeClass('hidden');

        // parent_template.updateItemCount();
      }
    }

    //add existing text fields
    for (let question of multi_text.questions) multi_text.createField(question);

    this.setDefaultField();
    // $(this.edit_question_DOM).find(".wrapper").first().attr("class", "wrapper TopBottomPad");

    // this.updateEmptyFields();

    this.inspectErrors();

    if (!this.is_sub_question) $(this.branching_icon).find('img').attr('src', this.scroll_icon_src);

    // this.setMode(this.mode);
  }

  createField(question) {
    // console.log("creating field")

    let multi_text = this;

    let index = question ? multi_text.questions.indexOf(question) : multi_text.questions.length;

    let template = this.parent_template;

    if (!question) {
      // if field is being created from scratch
      question = {
        type: 'Text Field',
        required: template.required_default,
        instructions: null,
        mode: 'short',
        label: 'Response ' + (index + 1),
        value: 'response_' + (index + 1),
        decline: null,
      };
      multi_text.questions.push(question);
    }

    let instruction_class = 'instructionText';
    if (!question.instructions) instruction_class += ' hidden';

    let decline_class = 'buttonDecline disabled';
    let decline_label = 'Prefer not to answer';
    if (question.decline) {
      decline_label = question.decline.label;
    } else {
      decline_class += ' hidden';
    }

    let text_class = 'textFieldPlaceHolder shortAnswer';

    let required_class = 'optionsWrapper';
    if (!this.required) required_class += ' hidden';

    let view_mode_field = DOM.new({
      tag: 'div',
      class: 'wrapper noSidePad multiText viewMode',
      children: [
        {
          tag: 'div',
          class: required_class,
          children: [{ tag: 'p', class: 'editFieldLabel inline boldText redText', html: 'Required' }],
        },
        { tag: 'p', class: 'questionText', html: question.label },
        { tag: 'p', class: instruction_class, html: question.instructions },
        { tag: 'div', class: 'wrapper centerText', children: [{ tag: 'textarea', class: text_class }] },
        {
          tag: 'div',
          class: 'wrapper',
          children: [{ tag: 'div', class: decline_class }],
        },
      ],
    });

    if (this.is_sub_question) {
      view_mode_field = DOM.new({
        tag: 'div',
        class: 'wrapper noSidePad multiText viewMode',
        children: [
          { tag: 'p', class: 'questionNumber', html: this.getSubQuestionNumber(question) },
          {
            tag: 'div',
            class: 'optionsWrapper',
            children: [{ tag: 'p', class: 'editFieldLabel inline boldText redText', html: 'Required' }],
          },
          { tag: 'p', class: 'questionText', html: question.label },
          { tag: 'p', class: instruction_class, html: question.instructions },
          { tag: 'div', class: 'wrapper centerText', children: [{ tag: 'textarea', class: text_class }] },
          {
            tag: 'div',
            class: 'wrapper',
            children: [{ tag: 'div', class: decline_class }],
          },
        ],
      });
    }

    let edit_mode_field = DOM.new({
      tag: 'div',
      class: 'wrapper multiTextField',
      children: [
        multi_text.getRequiredSelector(index),
        {
          tag: 'div',
          class: 'modeSelector',
          children: [
            {
              tag: 'div',
              class: 'modeOption toggled',
              html: 'Short Text',
              click: function () {
                multi_text.setMode('short', index);
              },
            },
            {
              tag: 'div',
              class: 'modeOption',
              html: 'Medium Text',
              click: function () {
                multi_text.setMode('medium', index);
              },
            },
            {
              tag: 'div',
              class: 'modeOption',
              html: 'Long Text',
              click: function () {
                multi_text.setMode('long', index);
              },
            },
          ],
        },
        {
          tag: 'div',
          class: 'buttonRemoveField',
          html: SVG.getBlackCloseOutIcon(),
          click: function () {
            let index = $.inArray($(this)[0], $(multi_text.edit_question_DOM).find('.buttonRemoveField'));
            multi_text.removeField(index);
          },
        },

        multi_text.getQuestionField(index),
        multi_text.getInstructionField(index),
        { tag: 'div', class: 'wrapper', children: [{ tag: 'textarea', class: text_class }] },

        multi_text.addDeclineOptionRow(index),

        // multi_text.getMultiTextDeclineField(index),
      ],
    });

    if (this.is_sub_question) {
      edit_mode_field = DOM.new({
        tag: 'div',
        class: 'wrapper multiTextField',
        children: [
          { tag: 'p', class: 'questionNumber', html: this.getSubQuestionNumber(question) },
          multi_text.getRequiredSelector(index),
          {
            tag: 'div',
            class: 'modeSelector',
            children: [
              {
                tag: 'div',
                class: 'modeOption toggled',
                html: 'Short Text',
                click: function () {
                  multi_text.setMode('short', index);
                },
              },
              {
                tag: 'div',
                class: 'modeOption',
                html: 'Medium Text',
                click: function () {
                  multi_text.setMode('medium', index);
                },
              },
              {
                tag: 'div',
                class: 'modeOption',
                html: 'Long Text',
                click: function () {
                  multi_text.setMode('long', index);
                },
              },
            ],
          },
          {
            tag: 'div',
            class: 'buttonRemoveField',
            html: SVG.getBlackCloseOutIcon(),
            click: function () {
              let index = $.inArray($(this)[0], $(multi_text.edit_question_DOM).find('.buttonRemoveField'));
              multi_text.removeField(index);
            },
          },

          multi_text.getQuestionField(index),
          multi_text.getInstructionField(index),
          { tag: 'div', class: 'wrapper', children: [{ tag: 'textarea', class: text_class }] },

          multi_text.addDeclineOptionRow(index),

          // multi_text.getMultiTextDeclineField(index),
        ],
      });
    }

    $(edit_mode_field).insertBefore($(multi_text.edit_question_DOM).find('.addTextFieldWrapper').parent());

    if (multi_text.is_sub_question) {
      $(view_mode_field).appendTo(multi_text.view_question_DOM);

      if (multi_text.is_decline_sub_question) {
      } else {
      }
    } else {
      if ($(multi_text.view_question_DOM).find('.multiText').length) {
        $(view_mode_field).insertAfter($(multi_text.view_question_DOM).find('.multiText').last());
      } else {
        $(view_mode_field).insertAfter($(multi_text.view_question_DOM).find('p.headingText'));
      }
    }

    if (question.decline) multi_text.addDeclineOption(index);
    $(edit_mode_field).find('.optionValueField').val(question.value);

    multi_text.setMode(question.mode, index);
    multi_text.parent_template.save();
  }

  getInstructionField(index) {
    let question_index = index > -1 ? index : -1;
    let question_DOM = this;
    let question = this.questions[index] ? this.questions[index] : this.parent_question.decline.sub_question;
    let parent_template = this.parent_template;
    let display_class = 'instructionText hidden';

    if (!question.instructions) display_class === 'hidden';

    if (!question.instructions) {
      display_class === 'hidden';
      $($(question_DOM.view_question_DOM).find('p.instructionText')[question_index]).removeClass('hidden');
      if (question.instructions === '')
        $($(question_DOM.view_question_DOM).find('p.instructionText')[question_index]).addClass('hidden');
    } else {
      $($(question_DOM.view_question_DOM).find('p.instructionText')[question_index]).addClass('hidden');
    }

    return {
      tag: 'div',
      class: 'wrapper',
      children: [
        { tag: 'p', class: 'editFieldLabel', html: 'Instructions' },
        {
          tag: 'textarea',
          class: 'instructionField',
          rows: 1,
          html: question.instructions,
          blur: function () {
            question.instructions = $(this).val().trim();
            if (question.hasOwnProperty('metadata')) question.metadata.instructions = $(this).val().trim();

            if (!question.is_sub_question) {
              $($(question_DOM.view_question_DOM).find('p.instructionText')[question_index]).html(question.instructions);
              if (!question.instructions) {
                $($(question_DOM.view_question_DOM).find('p.instructionText')[question_index]).addClass('hidden');
              } else {
                $($(question_DOM.view_question_DOM).find('p.instructionText')[question_index]).removeClass('hidden');
              }
            } else {
              $($(question_DOM.view_question_DOM).find('p.instructionText')[question_index]).html(question.instructions);
              if (!question.instructions) {
                $($(question_DOM.view_question_DOM).find('p.instructionText')[question_index]).addClass('hidden');
              } else {
                $($(question_DOM.view_question_DOM).find('p.instructionText')[question_index]).removeClass('hidden');
              }
            }

            parent_template.save();
          },

          keyup: function () {
            let view_field = question.is_sub_question
              ? $($(question_DOM.view_question_DOM).find('p.instructionText')[question_index])
              : $($(question_DOM.view_question_DOM).find('p.instructionText')[question_index]);

            if (parent_template.update_timer !== null) clearTimeout(parent_template.update_timer);
            let input = $(this);
            parent_template.update_timer = setTimeout(function () {
              question.instructions = $(input).val().trim();
              if (question.hasOwnProperty('metadata')) question.metadata.instructions = $(input).val().trim();
              $($(question_DOM.view_question_DOM).find('p.instructionText')[question_index]).html(question.instructions);
              if (!question.instructions) {
                $(view_field).addClass('hidden');
              } else {
                $(view_field).removeClass('hidden');
              }
              parent_template.save();
            }, 100);
          },
          input: function () {
            $(this).outerHeight(this.scrollHeight);
          },
        },
      ],
    };
  }

  getQuestionField(index) {
    let multi_text = this;
    let text_field = this.questions[index];

    let parent_template = this.parent_template;

    let variable_name = text_field.value ? text_field.value : Utils.formatVariableName(text_field.label);

    let label = this.is_sub_question ? 'Sub Question' : 'Question';

    return {
      tag: 'div',
      class: 'questionOption textOption',
      children: [
        { tag: 'p', class: 'editFieldLabel questionLabelField', html: label },
        {
          tag: 'textarea',
          class: 'questionField',
          html: text_field.label,
          rows: 1,
          blur: function () {
            // text_field.label = $(this).val().trim();
            // $($(multi_text.view_question_DOM).find(".questionText")[index]).html(text_field.label.trim());
            // $($(multi_text.edit_question_DOM).find(".questionValueField")[index]).val(Utils.formatVariableName(text_field.label));
            // parent_template.save();
            // // multi_text.updateEmptyContent();
          },
          keyup: function () {
            if (parent_template.update_timer !== null) clearTimeout(parent_template.update_timer);
            let value = $(this).val().trim();
            let input = $(this);

            parent_template.update_timer = setTimeout(function () {
              text_field.label = value;
              text_field.value = Utils.formatVariableName(text_field.label);

              $($(multi_text.view_question_DOM).find('.questionText')[index]).html(text_field.label.trim());
              $($(multi_text.edit_question_DOM).find('.optionValueField')[index]).val(text_field.value);

              if (value) {
                $(input).parent().parent().removeClass('questionError');
                $($(multi_text.view_question_DOM).find('.questionText')[index]).removeClass('redText');
              } else {
                $(input).parent().parent().addClass('questionError');
                $($(multi_text.view_question_DOM).find('.questionText')[index]).addClass('redText');
              }

              if (multi_text.is_sub_question) {
                $($(multi_text.view_question_DOM).find('.questionText')[index]).html(text_field.label.trim());
                $($(multi_text.edit_question_DOM).find('.optionValueField')[index]).val(
                  Utils.formatVariableName(text_field.label)
                );

                multi_text.parent_question.inspectErrors();
              } else {
                multi_text.inspectErrors();
              }
            }, 100);
          },
          input: function () {
            $(this).outerHeight(this.scrollHeight);
          },
        },

        multi_text.getVariableNameField(index),
      ],
    };
  }

  getVariableNameField(index) {
    let multi_text = this;
    let parent_template = this.parent_template;
    let text_field = this.questions[index];

    let value = text_field.value;

    return {
      tag: 'div',
      class: 'optionValueWrapper',
      children: [
        {
          tag: 'input',
          class: 'optionValueField',
          value: value,
          keydown: function (e) {
            // if (!Utils.charWhitelist.includes(e.which) || e.shiftKey) e.preventDefault();
          },
          blur: function () {
            text_field.value = $(this).val().trim();
            multi_text.inspectErrors();
          },
          keyup: function () {
            let input = $(this);
            if (parent_template.update_timer) clearTimeout(parent_template.update_timer);
            let value = $(input).val().trim();
            clearTimeout(parent_template.update_timer);
            parent_template.update_timer = setTimeout(function () {
              text_field.value = Utils.formatVariableName(value);
              // multi_text.metadata.value = multi_text.value;
              $(input).val(text_field.value);
              multi_text.inspectErrors();
            }, 1000);
          },
        },
      ],
    };
  }

  removeField(index) {
    this.questions.splice(index, 1);
    $($(this.edit_question_DOM).find('.multiTextField')[index]).remove();
    $($(this.view_question_DOM).find('.noSidePad')[index]).remove();

    //add default text field when last field deleted
    if (!this.questions.length) {
      this.createField();
    } else {
      this.setDefaultField();
    }

    if (this.is_sub_question) this.updateSubQuestionNumbers();

    this.parent_template.save();
  }

  setDefaultField() {
    if (this.questions.length === 1) {
      let default_field = $($(this.edit_question_DOM).find('.multiTextField')[0]);
      $(default_field).find('.buttonRemoveField').addClass('unclickable');
      $(default_field).find('.buttonRemoveField').html('');
    } else {
      $(this.edit_question_DOM).find('.buttonRemoveField').removeClass('unclickable').html(SVG.getBlackCloseOutIcon());
    }
  }

  // addField(metadata) {
  //
  //     let multi_text = this;
  //     let index = multi_text.questions.length;
  //
  //     let question_metadata = (metadata) ? metadata : {
  //         "type": "Text Field",
  //         "required": true,
  //         "charlimit": 100,
  //         "instructions": null,
  //         "mode": "short",
  //         "label": "Response " + (index + 1),
  //         "value": "response_" + (index + 1),
  //         "decline": null
  //     };
  //
  //     if (!metadata) multi_text.questions.push(question_metadata);
  //
  //     let view_mode_field = DOM.new({
  //         tag: "div", class: "wrapper noSidePad multiText", children: [
  //             {
  //                 tag: "div", class: "optionsWrapper", children: [
  //                     {tag: "p", class: "editFieldLabel inline boldText redText", html: "Required"}
  //                 ]
  //             },
  //             {tag: "p", class: "questionText", html: question_metadata.label},
  //             {tag: "p", class: "instructionText hidden"},
  //             {
  //                 tag: "div", class: "wrapper centerText", children: [
  //                     {tag: "textarea", class: "shortAnswer textFieldPlaceHolder"},
  //                 ]
  //             },
  //             {tag: "div", class: "wrapper", children: [
  //                     {tag: "div", class: "buttonDecline disabled hidden"}
  //                 ]
  //             }
  //         ]
  //     });
  //
  //     let new_field = DOM.new({
  //         tag: "div", class: "wrapper multiTextField", children: [
  //             this.getRequiredSelector(index),
  //             {tag: "div", class: "modeSelector", children: [
  //                     {
  //                         tag: "div", class: "modeOption toggled", html: "Short Text", click: function () {
  //                             $(this).parent().find(".toggled").removeClass("toggled");
  //                             $(this).addClass("toggled");
  //                             $(this).parent().parent().find(".textFieldPlaceHolder").attr("class", "shortAnswer textFieldPlaceHolder");
  //                         }
  //                     },
  //
  //                     {
  //                         tag: "div", class: "modeOption", html: "Medium Text", click: function () {
  //                             $(this).parent().find(".toggled").removeClass("toggled");
  //                             $(this).addClass("toggled");
  //                             $(this).parent().parent().find(".textFieldPlaceHolder").attr("class", "mediumAnswer textFieldPlaceHolder");
  //                         }
  //                     },
  //                     {
  //                         tag: "div", class: "modeOption", html: "Long Text", click: function () {
  //                             $(this).parent().find(".toggled").removeClass("toggled");
  //                             $(this).addClass("toggled");
  //                             $(this).parent().parent().find(".textFieldPlaceHolder").attr("class", "longAnswer textFieldPlaceHolder");
  //                         }
  //                     },
  //                 ]
  //             },
  //             {
  //                 tag: "div", class: "buttonRemoveField", html: SVG.getBlackCloseOutIcon(), click: function () {
  //                     let index = $.inArray($(this)[0], $(multi_text.edit_question_DOM).find(".buttonRemoveField"));
  //                     multi_text.removeField(index);
  //                 }
  //             },
  //             multi_text.getQuestionField(index),
  //             multi_text.getInstructionField(index),
  //             {tag: "div",
  //                 class: "wrapper",
  //                 children: [{tag: "textarea", class: "shortAnswer textFieldPlaceHolder"}]
  //             },
  //
  //             multi_text.addDeclineOptionRow(index)
  //
  //             // multi_text.getMultiTextDeclineField(index),
  //         ]
  //     });
  //
  //     $(new_field).insertBefore($(multi_text.edit_question_DOM).find(".addTextFieldWrapper").parent());
  //
  //     if ($(multi_text.view_question_DOM).find(".multiText").length) {
  //         $(view_mode_field).insertAfter($($(multi_text.view_question_DOM).find(".multiText")[index - 1]));
  //     } else {
  //         $(view_mode_field).insertAfter($(multi_text.view_question_DOM).find("p.headingText"));
  //     }
  //
  //     // $(new_field).find(".questionField").val(question_metadata.label);
  //     // $(new_field).find(".questionValueField").val(Utils.formatVariableName(question_metadata.value));
  //
  //
  //     multi_text.setDefaultField();
  //     multi_text.parent_template.save();
  // }

  addFieldRow() {
    let multi_text = this;

    return {
      tag: 'div',
      class: 'addOptionWrapper',
      children: [
        {
          tag: 'div',
          class: 'addTextFieldWrapper',
          children: [
            { tag: 'button', label: SVG.getBlackPlusSign(), style: ['buttonAddAnswer'] },
            { tag: 'p', class: 'addNewOptionLabel', html: 'Add Text Field' },
          ],
          click: function () {
            multi_text.createField();
          },
        },
      ],
    };

    // return {tag: "div", class: "addOptionWrapper", click: function () {
    //         single_answer.addOption()
    //     }, children: [
    //         {tag: "button", label: SVG.getBlackPlusSign(), style: ["buttonAddAnswer"]},
    //         {tag: "p", class: "addNewOptionLabel", html: "Add Answer"}
    //     ]}
  }

  addDeclineOptionRow(index) {
    let multi_text = this;
    let parent_template = multi_text.parent_template;
    let question = multi_text.questions[index];

    let decline_option = {
      tag: 'div',
      class: 'declineOption hidden',
      children: [
        {
          tag: 'div',
          class: 'declineOptionWrapper',
          children: [
            { tag: 'p', class: 'declineLabel', html: 'Decline Option' },
            {
              tag: 'button',
              style: ['MultipleChoiceBubble', 'removableAnswer'],
              label: SVG.getBlackCloseOutIcon(),
              click: removeDecline,
            },
            {
              tag: 'textarea',
              class: 'optionField',
              rows: 1,
              keyup: function () {
                if (parent_template.update_timer !== null) clearTimeout(parent_template.update_timer);
                let input = $(this);
                parent_template.update_timer = setTimeout(function () {
                  question.decline = { label: $(input).val().trim() };
                  // question.metadata.decline.label = question.decline.label;
                  $($(multi_text.view_question_DOM).find('.buttonDecline')[index]).html(question.decline.label);
                  $($(multi_text.view_question_DOM).find('.buttonDecline')[index]).removeClass('hidden');
                  parent_template.save();
                }, 250);

                // if (parent_template.update_timer !== null) clearTimeout(parent_template.update_timer);
                //
                // let input = $(this);
                //
                // parent_template.update_timer = setTimeout(function () {
                //
                //     single_answer.decline.label = $(input).val().trim();
                //     single_answer.decline.value = Utils.formatVariableName($(input).val().trim());
                //     $(input).parent().parent().find(".optionValueField").val(single_answer.decline.value);
                //
                //     // single_answer.metadata.decline.label = single_answer.decline.label;
                //
                //     if ($(input).val()) {
                //         $($(single_answer.view_question_DOM).find(view_mode_selector_class)).children("p").html($(input).val().trim()).removeClass("redText");
                //         // $($(single_answer.edit_question_DOM).find(".optionValueField")[j]).val(Utils.formatVariableName($(input).val().trim()));
                //     } else {
                //         $($(single_answer.view_question_DOM).find(view_mode_selector_class)).children("p").html(Questionnaires2.NO_ANSWER_TEXT).addClass("redText");
                //     }
                //     // single_answer.updateEmptyFields();
                // }, 250)
              },
              input: function () {
                //resize field on input
                $(this).outerHeight(this.scrollHeight);
              },
            },
          ],
        },
      ],
    };

    function addDecline() {
      multi_text.addDeclineOption(index);

      //
      // if (question.decline) {
      //
      //     question.decline = null;
      //     let DOM_index = index;
      //
      //     // $($(multi_text.edit_question_DOM).find(".addDeclineOptionWrapper")[DOM_index]).children(".buttonAddAnswer").html(SVG.getBlackCloseOutIcon())
      //     $($(multi_text.edit_question_DOM).find(".addDeclineOptionWrapper")[DOM_index]).children(".declineOption").addClass("hidden");
      //     $($(multi_text.edit_question_DOM).find(".addDeclineOptionWrapper")[DOM_index]).children("p.addNewOptionLabel, .buttonAddAnswer").removeClass("hidden");
      //
      //     //decline with always be last option
      //     $($(multi_text.view_question_DOM).find(".buttonDecline")[DOM_index]).addClass("hidden");
      //     multi_text.parent_template.save();
      //
      // } else {
      //
      //     multi_text.addDeclineOption(index);
      // }
    }

    function removeDecline() {
      question.decline = null;
      let DOM_index = index;

      // $($(multi_text.edit_question_DOM).find(".addDeclineOptionWrapper")[DOM_index]).children(".buttonAddAnswer").html(SVG.getBlackCloseOutIcon())
      $($(multi_text.edit_question_DOM).find('.addDeclineOptionWrapper')[DOM_index]).children('.declineOption').addClass('hidden');
      $($(multi_text.edit_question_DOM).find('.addDeclineOptionWrapper')[DOM_index])
        .children('p.addNewOptionLabel, .buttonAddAnswer')
        .removeClass('hidden');

      //decline with always be last option
      $($(multi_text.view_question_DOM).find('.buttonDecline')[DOM_index]).addClass('hidden');
      multi_text.parent_template.save();
    }

    return {
      tag: 'div',
      class: 'addDeclineOptionWrapper',
      children: [
        { tag: 'button', label: SVG.getBlackPlusSign(), style: ['buttonAddAnswer'], click: addDecline },
        { tag: 'p', class: 'addNewOptionLabel', html: 'Add Decline Option', click: addDecline },
        decline_option,
      ],
    };
  }

  addDeclineOption(DOM_index) {
    let multi_text = this;
    let question = multi_text.questions[DOM_index];
    let parent_template = multi_text.parent_template;

    if (!question.decline) {
      question.decline = { label: 'Prefer not to answer' };
    } else {
      if (!question.decline.label) question.decline = { label: 'Prefer not to answer' };
    }

    $($(multi_text.view_question_DOM).find('.buttonDecline')[DOM_index]).html(question.decline.label);
    $($(multi_text.view_question_DOM).find('.buttonDecline')[DOM_index]).removeClass('hidden');

    // $($(multi_text.edit_question_DOM).find(".declineButtonInput")[DOM_index]).val(question.decline.label);

    $($(multi_text.edit_question_DOM).find('.optionField')[DOM_index]).val(question.decline.label);

    // $($(multi_text.edit_question_DOM).find(".declineButtonInput")[DOM_index]).removeClass("hidden");

    // $($(multi_text.edit_question_DOM).find(".addDeclineOptionWrapper")[DOM_index]).children(".buttonAddAnswer").html(SVG.getBlackCloseOutIcon())
    $($(multi_text.edit_question_DOM).find('.addDeclineOptionWrapper')[DOM_index]).children('.declineOption').removeClass('hidden');
    $($(multi_text.edit_question_DOM).find('.addDeclineOptionWrapper')[DOM_index])
      .children('p.addNewOptionLabel, .buttonAddAnswer')
      .addClass('hidden');

    // $($(multi_text.edit_question_DOM).find(".addDeclineOptionWrapper")[DOM_index]).addClass("unclickable");

    //
    // $($(multi_text.edit_question_DOM).find(".addDeclineOptionWrapper")[DOM_index]).children("p.addNewOptionLabel").addClass("hidden");
    // $($(multi_text.edit_question_DOM).find(".addDeclineOptionWrapper")[DOM_index]).children("p.editFieldLabel").removeClass("hidden");

    multi_text.parent_template.save();
  }

  setMode(mode, index) {
    let textarea_class;
    let option_index;
    let text_field_mode = mode !== undefined ? mode : 'short';
    this.questions[index].mode = text_field_mode;

    let view_mode_field;
    let edit_mode_field;

    if (this.is_sub_question) {
      view_mode_field = $($(this.view_question_DOM).find('.multiText')[index]);
      edit_mode_field = $($(this.edit_question_DOM).find('.multiTextField')[index]);
    } else {
      view_mode_field = $($(this.view_question_DOM).children('.multiText')[index]);
      edit_mode_field = $($(this.edit_question_DOM).children('.multiTextField')[index]);
    }

    switch (text_field_mode) {
      case 'short': {
        // $(this.view_question_DOM).find("p.questionType").html("Short Text");
        textarea_class = 'shortAnswer';
        option_index = 0;
        break;
      }

      case 'medium': {
        // $(this.view_question_DOM).find("p.questionType").html("Medium Text");
        textarea_class = 'mediumAnswer';
        option_index = 1;
        break;
      }

      case 'long': {
        // $(this.view_question_DOM).find("p.questionType").html("Long Text");
        textarea_class = 'longAnswer';
        option_index = 2;
        break;
      }
    }

    textarea_class += ' textFieldPlaceHolder';

    // let current_class =  $($(view_mode_field).find(".textFieldPlaceHolder")[index]).attr("class");
    // $($(view_mode_field).find(".textFieldPlaceHolder")[index]).removeClass(textarea_class);

    $($(edit_mode_field).find('.textFieldPlaceHolder')).removeClass('shortAnswer mediumAnswer longAnswer');
    $($(view_mode_field).find('.textFieldPlaceHolder')).removeClass('shortAnswer mediumAnswer longAnswer');

    $($(edit_mode_field).find('.textFieldPlaceHolder')).addClass(textarea_class);
    $($(view_mode_field).find('.textFieldPlaceHolder')).addClass(textarea_class);

    // console.log($(view_mode_field).find(".textFieldPlaceHolder"));

    $(edit_mode_field).find('.modeSelector').children('.toggled').removeClass('toggled');
    $($(edit_mode_field).find('.modeOption')[option_index]).addClass('toggled');

    // $($(this.edit_question_DOM).find(".textFieldPlaceHolder")[index]).attr("class", textarea_class);
    // $($(this.view_question_DOM).find(".textFieldPlaceHolder")[index]).attr("class", textarea_class);

    // $($(this.edit_question_DOM).find(".modeSelector")[index]).children(".toggled").removeClass("toggled");
    // $($($(this.edit_question_DOM).find(".modeSelector")[index]).children(".modeOption")[option_index]).addClass("toggled");

    if (this.questions[index].required) {
      $(view_mode_field).find('.optionsWrapper').removeClass('hidden');
      $(edit_mode_field).find('.radioButtonActive').removeClass('radioButtonActive');
      $($(edit_mode_field).find('.radioButtonQuestionnaireSmall')[0]).addClass('radioButtonActive');
    } else {
      $(view_mode_field).find('optionsWrapper').addClass('hidden');
      $(edit_mode_field).find('.radioButtonActive').removeClass('.radioButtonActive');
      $($(edit_mode_field).find('.radioButtonQuestionnaireSmall')[1]).addClass('radioButtonActive');
    }

    this.parent_template.save();
  }

  getMultiTextDeclineField(index) {
    let multi_text = this;
    let question = this.questions[index];
    let parent_template = this.parent_template;

    return {
      tag: 'div',
      class: 'addDeclineOptionWrapper',
      children: [
        {
          tag: 'div',
          class: 'declineOptionWrapper',
          children: [
            { tag: 'button', label: SVG.getBlackPlusSign(), style: ['buttonAddAnswer'] },
            { tag: 'p', class: 'addNewOptionLabel', html: 'Add Decline Option' },
            { tag: 'p', class: 'editFieldLabel hidden', html: 'Decline Option' },
            {
              tag: 'input',
              class: 'declineButtonInput hidden',
              click: function (e) {
                e.stopPropagation();
              },
              blur: function () {
                question.decline = { label: $(this).val().trim() };
                // question.metadata.decline.label = question.decline.label;
                $($(multi_text.view_question_DOM).find('.buttonDecline')[index]).html(question.decline.label);
                $($(multi_text.view_question_DOM).find('.buttonDecline')[index]).removeClass('hidden');
                parent_template.save();
              },
              keyup: function () {
                if (parent_template.update_timer !== null) {
                  clearTimeout(parent_template.update_timer);
                  let input = $(this);
                  parent_template.update_timer = setTimeout(function () {
                    question.decline = { label: $(input).val().trim() };
                    // question.metadata.decline.label = question.decline.label;
                    $($(multi_text.view_question_DOM).find('.buttonDecline')[index]).html(question.decline.label);
                    $($(multi_text.view_question_DOM).find('.buttonDecline')[index]).removeClass('hidden');
                    parent_template.save();
                  }, 450);
                }
              },
            },
          ],
          click: function () {
            if (question.decline) {
              question.decline = null;
              let DOM_index = index;
              $($(multi_text.edit_question_DOM).find('.declineButtonInput')[DOM_index]).addClass('hidden');
              $($(multi_text.edit_question_DOM).find('.declineOptionWrapper')[DOM_index])
                .children('p.editFieldLabel')
                .addClass('hidden');
              $($(multi_text.edit_question_DOM).find('.declineOptionWrapper')[DOM_index])
                .children('.buttonAddAnswer')
                .html(SVG.getBlackPlusSign());
              $($(multi_text.edit_question_DOM).find('.declineOptionWrapper')[DOM_index])
                .children('p.answerLabel')
                .html('Add Decline Option');
              $($(multi_text.edit_question_DOM).find('.declineOptionWrapper')[DOM_index])
                .children('p.answerLabel')
                .removeClass('hidden');
              $($(multi_text.edit_question_DOM).find('.declineOptionWrapper')[DOM_index]).removeClass('unclickable');

              //decline with always be last option
              $($(multi_text.view_question_DOM).find('.buttonDecline')[DOM_index]).addClass('hidden');
              multi_text.parent_template.save();
            } else {
              multi_text.addMultiTextDeclineOption(index);
            }
          },
        },
      ],
    };
  }

  addMultiTextDeclineOption(index) {
    let DOM_index = index;

    let multi_text = this;
    let question = this.questions[index];
    let parent_template = this.parent_template;

    if (!question.decline) {
      question.decline = { label: 'Prefer not to answer' };
    } else {
      if (!question.decline.label) question.decline = { label: 'Prefer not to answer' };
    }

    $($(multi_text.view_question_DOM).find('.buttonDecline')[DOM_index]).html(question.decline.label);
    $($(multi_text.view_question_DOM).find('.buttonDecline')[DOM_index]).removeClass('hidden');

    $($(multi_text.edit_question_DOM).find('.declineButtonInput')[DOM_index]).val(question.decline.label);
    $($(multi_text.edit_question_DOM).find('.declineButtonInput')[DOM_index]).removeClass('hidden');

    $($(multi_text.edit_question_DOM).find('.declineOptionWrapper')[DOM_index])
      .children('.buttonAddAnswer')
      .html(SVG.getBlackCloseOutIcon());
    $($(multi_text.edit_question_DOM).find('.declineOptionWrapper')[DOM_index]).addClass('unclickable');
    $($(multi_text.edit_question_DOM).find('.declineOptionWrapper')[DOM_index]).children('.answerLabel').addClass('hidden');
    $($(multi_text.edit_question_DOM).find('.declineOptionWrapper')[DOM_index]).children('p.editFieldLabel').removeClass('hidden');

    multi_text.parent_template.save();
  }

  getRequiredSelector(index) {
    //returns edit mode required selector div

    let question = this;
    let text_field = this.questions[index];
    let template = this.parent_template;

    let true_class = 'radioButtonQuestionnaireSmall';
    let false_class = 'radioButtonQuestionnaireSmall';

    let question_index = index !== undefined ? index : 0;

    if (!text_field.required) {
      false_class += ' radioButtonActive';
    } else {
      true_class += ' radioButtonActive';
      $($(question.view_question_DOM).find('.optionsWrapper')[question_index]).removeClass('hidden');
    }

    $($(question.view_question_DOM).find('.optionsWrapper')[question_index]).removeClass('hidden');

    return {
      tag: 'div',
      class: 'optionsWrapper',
      children: [
        { tag: 'p', class: 'editFieldLabel inline boldText', html: 'Required' },
        {
          tag: 'div',
          class: 'inlineContainer clickable',
          children: [
            { tag: 'button', class: true_class },
            { tag: 'p', class: 'editFieldLabel inline', html: 'True' },
          ],
          click: function () {
            $(this).parent().find('.radioButtonActive').removeClass('radioButtonActive');
            $(this).find('.radioButtonQuestionnaireSmall').addClass('radioButtonActive');
            $(this).addClass('unclickable').removeClass('clickable');
            $(this).next().removeClass('unclickable').addClass('clickable');
            $($(question.view_question_DOM).find('.optionsWrapper')[question_index]).removeClass('hidden');
            // question.required = true;
            text_field.required = true;

            template.save();
          },
        },

        //single page
        {
          tag: 'div',
          class: 'inlineContainer clickable',
          children: [
            { tag: 'button', class: false_class },
            { tag: 'p', class: 'editFieldLabel inline', html: 'False' },
          ],
          click: function () {
            $($(question.view_question_DOM).find('.optionsWrapper')[question_index]).addClass('hidden');
            $(this).parent().find('.radioButtonActive').removeClass('radioButtonActive');
            $(this).find('.radioButtonQuestionnaireSmall').addClass('radioButtonActive');
            $(this).addClass('unclickable').removeClass('clickable');
            $(this).prev().removeClass('unclickable').addClass('clickable');
            // question.required = false;
            text_field.required = false;

            template.save();
          },
        },
      ],
    };
  }

  // updateEmptyFields() {
  //
  //     console.log("test")
  //
  //
  //     this.setTextAreaHeight();
  //
  //     //if not a sub question, clear all errors
  //     //then step through and add errors
  //     this.updateError(false);
  //
  //     let error;
  //     for (let text_field of this.questions) {
  //
  //         // console.log(text_field.label)
  //         let index = this.questions.indexOf(text_field)
  //
  //         if (!text_field.label) {
  //             $($(this.view_question_DOM).children(".multiText")[index]).children("p.questionText").html(Questionnaires2.NO_ANSWER_TEXT).addClass("redText")
  //             $($(this.edit_question_DOM).children(".multiTextField")[index]).children(".textOption").children("textarea").addClass("questionError")
  //             error = true;
  //         } else {
  //             $($(this.view_question_DOM).children(".multiText")[index]).children("p.questionText").removeClass("redText")
  //             $($(this.edit_question_DOM).children(".multiTextField")[index]).children(".textOption").children("textarea").removeClass("questionError")
  //         }
  //     }
  //
  //     if (error) {
  //
  //         this.updateError(true);
  //
  //     } else {
  //         // console.log("no error multi text")
  //     }
  //
  //     this.parent_template.save();
  // };

  inspectTextErrors() {
    this.setTextAreaHeight();

    //if not a sub question, clear all errors
    //then step through and add errors
    this.updateError(false);

    let error;
    for (let text_field of this.questions) {
      // console.log(text_field.label)
      let index = this.questions.indexOf(text_field);

      if (!text_field.label) {
        $($(this.view_question_DOM).children('.multiText')[index])
          .children('p.questionText')
          .html(Questionnaires.NO_ANSWER_TEXT)
          .addClass('redText');
        $($(this.edit_question_DOM).children('.multiTextField')[index])
          .children('.textOption')
          .children('textarea')
          .addClass('questionError');
        error = true;
      } else {
        $($(this.view_question_DOM).children('.multiText')[index]).children('p.questionText').removeClass('redText');
        $($(this.edit_question_DOM).children('.multiTextField')[index])
          .children('.textOption')
          .children('textarea')
          .removeClass('questionError');
      }
    }

    if (error) {
      this.updateError(true);
    } else {
      // console.log("no error multi text")
    }

    this.parent_template.save();

    // if (error) error = "invalid_Q" + this.template_question_num;
    return error;

    //after adding errors from sub questions, add error from parent question if there is one
    // if (error) this.updateError(true);
    // single_option.parent_template.save();
  }

  getSubQuestionField() {
    // console.log()

    let range = this;
    let parent_template = this.parent_template;

    // let variable_name = range.label.replace(new RegExp(' ', 'g'), '_').substring(0, 30);

    let label = range.questions[0].label;

    let variable_name = Utils.formatVariableName(label);

    return {
      tag: 'div',
      class: 'wrapper',
      children: [
        { tag: 'p', class: 'editFieldLabel', html: 'Sub Question' },
        {
          tag: 'textarea',
          class: 'shortAnswer',
          html: label,
          blur: function () {
            range.questions[0].label = $(this).val().trim();
            $(range.view_question_DOM).children('.questionText').html(range.questions[0].label.trim());
            range.updateEmptyFields();
          },
          keyup: function () {
            if (parent_template.update_timer !== null) {
              let value = $(this).val().trim();
              clearTimeout(parent_template.update_timer);
              parent_template.update_timer = setTimeout(function () {
                range.questions[0].label = value;
                $(range.view_question_DOM).children('.questionText').html(range.questions[0].label.trim());
                $(range.reorder_list_item)
                  .children('.reorderQuestionText')
                  .html('Q' + range.question_num + ': ' + range.questions[0].label);
                range.updateEmptyFields();
              }, 450);
            }
          },
        },
        {
          tag: 'div',
          class: 'wrapperNoPad alignLeft',
          children: [{ tag: 'input', class: 'questionValueField', value: variable_name }],
        },
      ],
    };
  }

  updateSubQuestionNumbers() {
    //update sub question numbers in the case of a deletion

    if (this.is_sub_question) {
      let view_mode_sub_question_labels = $(this.view_question_DOM).find('p.questionNumber');
      let edit_mode_sub_question_labels = $(this.edit_question_DOM).find('p.questionNumber');

      let sub_question_number = super.getSubQuestionNumber();
      let char = 'a';

      $.each($(this.view_question_DOM).find('p.questionNumber'), function (index, value) {
        $(value).html(sub_question_number + '-' + char.toUpperCase());
        char = Utils.nextAlphabetChar(char);
      });

      char = 'a';
      $.each($(this.edit_question_DOM).find('p.questionNumber'), function (index, value) {
        $(value).html(sub_question_number + '-' + char.toUpperCase());
        char = Utils.nextAlphabetChar(char);
      });

      // sub_question_number = "Q" + parent_question.template_question_num + "-" + char.toUpperCase();
    }
  }

  getSubQuestionNumber(question) {
    let sub_question_number = super.getSubQuestionNumber();

    if (sub_question_number) {
      let sub_question_char = 'a';
      let index = this.questions.indexOf(question);

      for (let i = 0; i < index; i++) sub_question_char = Utils.nextAlphabetChar(sub_question_char);
      sub_question_number += '-' + sub_question_char.toUpperCase();
    }

    return sub_question_number;
  }

  getResponse() {
    //returns array of responses

    // return this.responseStrings;

    let responses = [];
    for (let question of this.questions) {
      if (question.responseStrings) {
        for (let string of question.responseStrings) responses.push(string);
      } else {
        // responses.push("");
        // responses.push("")
      }
    }

    // console.log(responses)
    return responses.length ? responses : [''];
  }

  drawEditableResponse(container) {
    super.drawEditableResponse();

    let view = $(this.asset_edit_view);
    let responses = this.getResponse();
    let question = this;

    for (let index in responses) $($(view).find('textarea').get(index)).html(responses[index]);
    let timer = null;

    let text_responses = $(view).find('textarea');
    $(text_responses).keyup(function () {
      let new_value = $(this).val();
      let textarea = this;
      timer = setTimeout(function () {
        clearTimeout(timer);
        let response_index = $.inArray(textarea, text_responses);
        question.questions[response_index].responseStrings = [new_value];
      }, 150);
    });
    $(view).appendTo($(container));
  }

  drawViewResponse(container) {
    super.drawViewResponse();

    let question = this;
    let parent_template = this.parent_template;

    let view = $(this.asset_view_view);
    if (!this.heading) $(view).find('p.headingText').remove();
    let responses = this.getResponse();
    let i = 0;
    for (let response of responses) {
      let item = $(view).find('.multiText .centerText').get(i);
      $(item).empty();
      DOM.new({ tag: 'p', class: 'blackText', html: response, parent: item });
      i++;
    }

    if (question.hasOwnProperty('assetUuids')) {
      if (question.assetUuids) {
        if (question.assetUuids.length) {
          for (let uuid of question.assetUuids) {
            let asset = Assets.getAsset(uuid);

            // todo write parameters function to provide host and protocol
            let url =
              Parameters.deployment === 'live'
                ? 'https://rapid.apl.uw.edu' + asset.file_url
                : 'https://rapid2.apl.uw.edu' + asset.file_url;

            DOM.new({
              tag: 'img',
              class: 'embeddedAssetViewImg',
              src: url,
              parent: container,
              children: [
                {
                  tag: 'button',
                  class: 'view-embedded-asset-icon',
                  label: SVG.getEyeIcon(),
                  style: ['buttonEditItems', 'margin10'],
                  up_action: function () {
                    parent_template.getEmbeddedAssetViewer(question.id, uuid, 'map-container');
                  },
                },
              ],
              click: function () {
                // check for map view embedded asset element
                if ($('#map-info-panel .embeddedAssetViewImg').length) {
                  parent_template.getEmbeddedAssetViewer(question.id, uuid, 'map-container');
                }
              },
            });
          }
        }
      }
    }

    if (!question.is_sub_question) {
      $(view).appendTo($(container));
    } else {
      // remove sub questions because we will re-add them with completed answers
      let option_element = $(container).find('tr.questionOption')[question.answer_index];
      if ($(option_element).next().hasClass('subQuestion')) $(option_element).next().remove();
      $(view).insertAfter($(option_element));
    }
  }

  getAssetViewerTableCell() {
    let question = this;
    let questionnaire = question.parent_template;
    let responses = question.getResponse();

    function embedded_asset_element(uuid) {
      let asset = Assets.getAsset(uuid);

      let asset_label = asset.title != null ? asset.title : asset.type.toUpperCase();

      let filename = asset_label + '.' + asset.format.toLowerCase();

      return {
        tag: 'div',
        class: 'embeddedAssetRow',
        children: [
          { tag: 'img', class: 'embeddedAsset', src: asset.file_url },
          { tag: 'p', class: 'embeddedAssetCellLabel', html: "View '<b>" + filename + '</b>' },
        ],
        click: function () {
          questionnaire.getEmbeddedAssetViewer(question.id, uuid, 'questionnaire-viewer-container');
        },
        mouseover: function (e) {
          e.stopPropagation();
          e.stopImmediatePropagation();
          clearTimeout(questionnaire.questionnaire_asset_viewer.tooltip_timer);
          $(questionnaire.questionnaire_asset_viewer.tooltip).hide();
          $(this).parent().removeClass('tooltip-visible');
        },
        mouseleave: function () {
          $(this).removeClass('embedded-asset-selected');
        },
      };
    }

    function generate_question_cell(response, allow_embedded_assets) {
      let cell_children = [
        {
          tag: 'button',
          label: SVG.getPencilSmall(),
          style: ['buttonEditItems', 'button-edit-question'],
          up_action: function () {
            questionnaire.editCompletedQuestionnaire(question.id);
          },
        },
        { tag: 'div', children: [{ tag: 'p', html: response }] },
      ];

      // no embedded assets for sub questions at this time
      if (allow_embedded_assets) {
        if (question.hasOwnProperty('assetUuids')) {
          if (question.assetUuids.length) {
            for (let uuid of question.assetUuids) cell_children.push(embedded_asset_element(uuid));
          }
        }
      }
      return { tag: 'td', class: 'multi-text-cell', children: cell_children };
    }

    for (let response of responses) questionnaire.table_cells.push(generate_question_cell(response, true));
  }
}

//number fields
class NumberField extends Question {
  constructor(metadata, parent_template, question_num, template_question_num, section, is_new, parent_question, answer_index) {
    super(metadata, parent_template, question_num, template_question_num, section, is_new, parent_question, answer_index);

    this.scroll_icon_src = 'lib/images/icons/icon-integer-46x46.png';
    this.scroll_icon_error_src = 'lib/images/icons/icon-integer-error-46x46.png';
    $(this.scroll_icon).find('img').attr('src', this.scroll_icon_src);
    $(this.reorder_list_item).find('img').attr('src', this.scroll_icon_src);

    let text_field = this;
    if (!this.mode) this.mode = 'integer';

    let instruction_class = 'instructionText';
    instruction_class += ' hidden';

    this.view_question_DOM = DOM.new({
      tag: 'div',
      class: 'questionWrapper',
      children: [
        { tag: 'p', class: 'questionNumber', html: 'Q' + template_question_num },
        {
          tag: 'div',
          class: 'optionsWrapper',
          children: [{ tag: 'p', class: 'editFieldLabel inline boldText redText', html: 'Required' }],
        },
        { tag: 'p', class: 'questionType', html: this.type },
        { tag: 'p', class: 'headingText', html: this.heading },
        { tag: 'p', class: 'questionText', html: this.label },
        { tag: 'p', class: instruction_class, html: this.instructions },
        {
          tag: 'div',
          class: 'wrapper alignLeft',
          children: [{ tag: 'textarea', class: 'shortAnswer textFieldPlaceHolder', value: 'Please enter a date' }],
        },
        {
          tag: 'div',
          class: 'wrapper',
          children: [{ tag: 'div', class: 'buttonDecline disabled hidden', html: 'Prefer not to answer' }],
        },
      ],
    });

    if (!this.heading) $(this.view_question_DOM).find('p.headingText').addClass('hidden');

    let display_class = 'numberField textFieldPlaceHolder';

    this.edit_question_DOM = DOM.new({
      tag: 'div',
      class: 'questionWrapper',
      children: [
        { tag: 'p', class: 'questionNumber', html: 'Q' + template_question_num },
        this.getRequiredSelector(),
        { tag: 'p', class: 'questionType hidden', html: this.type },
        {
          tag: 'div',
          class: 'modeSelector',
          children: [
            {
              tag: 'div',
              class: 'modeOption toggled',
              html: 'Integer',
              click: function () {
                text_field.setMode('integer');
              },
            },
            {
              tag: 'div',
              class: 'modeOption',
              html: 'Decimal',
              click: function () {
                text_field.setMode('decimal');
              },
            },
          ],
        },

        text_field.getHeadingField(),
        text_field.getQuestionField(),
        text_field.getInstructionField(),
        {
          tag: 'div',
          class: 'wrapperExtraTopPad alignLeft',
          children: [{ tag: 'textarea', class: display_class }],
        },
        text_field.addDeclineOptionRow(),
        {
          tag: 'div',
          class: 'wrapperExtraTopPad',
          children: [
            {
              tag: 'button',
              class: 'buttonDeleteQuestion',
              label: 'Delete Question',
              up_action: function () {
                text_field.getDeleteQuestionForm();
              },
            },
          ],
        },
      ],
    });

    if (is_new) {
      //add new question to template
      if (!parent_template.edit_mode) parent_template.toggleView();
      let new_question = parent_template.edit_mode ? $(this.edit_question_DOM) : $(this.view_question_DOM);
      $('#questionnaire-view-template').children().not('.newQuestionModalForm').remove();
      $(new_question).appendTo($('#questionnaire-view-template'));
      $('.questionScrollIcon, .headerScrollIcon, .sectionScrollIcon, .sectionScrollContainer').removeClass('iconActive');
      $(this.scroll_icon).addClass('iconActive');
      parent_template.updateItemCount();
    } else if (parent_question && answer_index > -1) {
      this.edit_question_DOM = DOM.new({
        tag: 'div',
        class: 'subQuestion',
        children: [
          { tag: 'p', class: 'questionNumber', html: this.getSubQuestionNumber() },
          text_field.getQuestionField(),
          {
            tag: 'div',
            class: 'wrapperExtraTopPad alignLeft',
            children: [{ tag: 'textarea', class: 'numberField textFieldPlaceHolder' }],
          },
        ],
      });

      this.view_question_DOM = DOM.new({
        tag: 'div',
        class: 'questionWrapper subQuestion indent',
        children: [
          { tag: 'p', class: 'questionNumber', html: this.getSubQuestionNumber() },
          { tag: 'p', class: 'questionText smallText', html: this.label },
          { tag: 'div', class: 'wrapper alignLeft', children: [{ tag: 'textarea', class: 'numberField textFieldPlaceHolder' }] },
        ],
      });

      let view_field = $($(parent_question.view_question_DOM).find('.questionOption')[answer_index]);
      let edit_field = $($(parent_question.edit_question_DOM).find('.questionOption')[answer_index]);

      $(this.view_question_DOM).insertAfter($(view_field));
      $(this.edit_question_DOM).appendTo($(edit_field));

      $($(parent_question.edit_question_DOM).find('.buttonAddSubQuestion')[answer_index]).addClass('hidden');
      $($(parent_question.edit_question_DOM).find('.buttonDeleteSubQuestion')[answer_index]).removeClass('hidden');

      parent_question.options[answer_index].sub_question = this.metadata;
      // parent_template.updateItemCount();
    }

    if (this.decline) this.addDeclineOption();

    if (this.type === 'Number') {
      this.setMode(this.mode);
    }

    $(this.branching_icon).find('img').attr('src', this.scroll_icon_src);
  }

  addDeclineOptionRow() {
    let question = this;
    let parent_template = question.parent_template;

    // if (!question.decline) {
    //     question.decline = {label: "Prefer not to answer"};
    // } else {
    //     if (!question.decline.label) {
    //         question.decline = {label: "Prefer not to answer"};
    //     }
    // }

    let decline_option = {
      tag: 'div',
      class: 'declineOption hidden',
      children: [
        {
          tag: 'div',
          class: 'declineOptionWrapper',
          children: [
            { tag: 'p', class: 'declineLabel', html: 'Decline Option' },
            {
              tag: 'button',
              style: ['MultipleChoiceBubble', 'removableAnswer'],
              label: SVG.getBlackCloseOutIcon(),
              click: removeDecline,
            },
            {
              tag: 'textarea',
              class: 'optionField',
              rows: 1,
              keyup: function () {
                if (parent_template.update_timer !== null) clearTimeout(parent_template.update_timer);
                let input = $(this);
                parent_template.update_timer = setTimeout(function () {
                  question.decline = { label: $(input).val().trim() };
                  // question.metadata.decline.label = question.decline.label;
                  $($(question.view_question_DOM).find('.buttonDecline')).html(question.decline.label);
                  $($(question.view_question_DOM).find('.buttonDecline')).removeClass('hidden');
                  parent_template.save();
                }, 250);
              },
              input: function () {
                //resize field on input
                $(this).outerHeight(this.scrollHeight);
              },
            },
          ],
        },
      ],
    };

    function addDecline() {
      question.addDeclineOption();
    }

    function removeDecline() {
      question.decline = null;

      // $($(multi_text.edit_question_DOM).find(".addDeclineOptionWrapper")[DOM_index]).children(".buttonAddAnswer").html(SVG.getBlackCloseOutIcon())
      $($(question.edit_question_DOM).find('.addDeclineOptionWrapper')).children('.declineOption').addClass('hidden');
      $($(question.edit_question_DOM).find('.addDeclineOptionWrapper'))
        .children('p.addNewOptionLabel, .buttonAddAnswer')
        .removeClass('hidden');

      //decline with always be last option
      $($(question.view_question_DOM).find('.buttonDecline')).addClass('hidden');
      question.parent_template.save();
    }

    return {
      tag: 'div',
      class: 'addDeclineOptionWrapper',
      children: [
        { tag: 'button', label: SVG.getBlackPlusSign(), style: ['buttonAddAnswer'], click: addDecline },
        { tag: 'p', class: 'addNewOptionLabel', html: 'Add Decline Option', click: addDecline },
        decline_option,
      ],
    };
  }

  addDeclineOption() {
    let question = this;
    let parent_template = question.parent_template;

    if (!question.decline) {
      question.decline = { label: 'Prefer not to answer' };
    } else {
      if (!question.decline.label) question.decline = { label: 'Prefer not to answer' };
    }

    // console.log(this.decline)

    $($(question.view_question_DOM).find('.buttonDecline')).html(question.decline.label);
    $($(question.view_question_DOM).find('.buttonDecline')).removeClass('hidden');

    $($(question.edit_question_DOM).find('.optionField')).val(question.decline.label);

    $($(question.edit_question_DOM).find('.addDeclineOptionWrapper')).children('.declineOption').removeClass('hidden');
    $($(question.edit_question_DOM).find('.addDeclineOptionWrapper'))
      .children('p.addNewOptionLabel, .buttonAddAnswer')
      .addClass('hidden');

    question.parent_template.save();
  }

  setMode(mode) {
    let textarea_class;
    let option_index;
    this.mode = mode;
    this.metadata.mode = mode;

    let label;

    // let label = (this.label === "Please enter a " + mode) ? "Please enter a " + mode: (this.label) ? this.label : "";

    this.scroll_icon_src = 'lib/images/icons/icon-' + mode + '-46x46.png';
    this.scroll_icon_error_src = 'lib/images/icons/icon-integer-error-46x46.png';
    textarea_class = 'numberField';

    switch (mode) {
      case 'integer': {
        label = this.label === 'Please enter a decimal' ? 'Please enter an integer' : this.label ? this.label : '';
        this.scroll_icon_src = 'lib/images/icons/icon-integer-46x46.png';
        this.scroll_icon_error_src = 'lib/images/icons/icon-integer-error-46x46.png';
        textarea_class = 'numberField';
        option_index = 0;
        break;
      }

      case 'decimal': {
        label = this.label === 'Please enter an integer' ? 'Please enter a decimal' : this.label ? this.label : '';
        this.scroll_icon_src = 'lib/images/icons/icon-decimal-46x46.png';
        this.scroll_icon_error_src = 'lib/images/icons/icon-decimal-error-46x46.png';
        textarea_class = 'numberField';
        option_index = 1;
        break;
      }
    }

    // mode2 = (this.label === "Please enter a " + mode2) ? "Please enter an " + mode1: "";

    // this.scroll_icon_src = "lib/images/icons/icon-" + mode2 + "-46x46.png";
    // this.scroll_icon_error_src = "lib/images/icons/icon-decimal-error-46x46.png";
    // textarea_class = "numberField";

    textarea_class += ' textFieldPlaceHolder';

    // $(this.edit_question_DOM).find(".textFieldPlaceHolder").attr("class", textarea_class);
    // $(this.view_question_DOM).find(".textFieldPlaceHolder").attr("class", textarea_class);

    $(this.edit_question_DOM).find('.modeSelector').children('.toggled').removeClass('toggled');
    $($(this.edit_question_DOM).find('.modeOption')[option_index]).addClass('toggled');

    this.label = label;

    $(this.edit_question_DOM).find('.questionField').first().val(label);
    $(this.edit_question_DOM).find('.questionValueField').first().val(Utils.formatVariableName(label));

    $(this.view_question_DOM).find('.questionText').html(label);
    $(this.view_question_DOM).find('.questionType').html(Utils.capitalize(this.mode));
    $(this.scroll_icon).find('img').attr('src', this.scroll_icon_src);
    $(this.reorder_list_item).find('img').attr('src', this.scroll_icon_src);

    if (!this.required || !this.hasOwnProperty('required')) $(this.view_question_DOM).find('.optionsWrapper').hide();

    this.parent_template.save();
  }

  drawEditableResponse(container) {
    super.drawEditableResponse();

    let view = $(this.asset_edit_view);
    let response = this.getResponse();
    let question = this;

    $(view).find('textarea').html(response);
    let timer = null;

    let text_responses = $(view).find('textarea');
    $(text_responses).keyup(function () {
      let new_value = $(this).val();
      let textarea = this;
      timer = setTimeout(function () {
        clearTimeout(timer);
        question.responseStrings = [new_value];
      }, 150);
    });
    $(view).appendTo($(container));
  }

  drawViewResponse(container) {
    super.drawViewResponse(container);

    let question = this;
    let parent_template = question.parent_template;
    let view = $(this.asset_view_view);
    if (!question.heading) $(view).find('p.headingText').remove();
    let item = $(view).find('.wrapper.alignLeft');

    $(item).empty();
    DOM.new({ tag: 'p', class: 'blackText', html: question.getResponse(), parent: item });

    if (question.hasOwnProperty('assetUuids')) {
      if (question.assetUuids) {
        if (question.assetUuids.length) {
          for (let uuid of question.assetUuids) {
            let asset = Assets.getAsset(uuid);

            // todo write parameters function to provide host and protocol
            let url =
              Parameters.deployment === 'live'
                ? 'https://rapid.apl.uw.edu' + asset.file_url
                : 'https://rapid2.apl.uw.edu' + asset.file_url;

            DOM.new({
              tag: 'img',
              class: 'embeddedAssetViewImg',
              src: url,
              parent: container,
              children: [
                {
                  tag: 'button',
                  class: 'view-embedded-asset-icon',
                  label: SVG.getEyeIcon(),
                  style: ['buttonEditItems', 'margin10'],
                  up_action: function () {
                    parent_template.getEmbeddedAssetViewer(question.id, uuid, 'map-container');
                  },
                },
              ],
              click: function () {
                // check for map view embedded asset element
                if ($('#map-info-panel .embeddedAssetViewImg').length) {
                  parent_template.getEmbeddedAssetViewer(question.id, uuid, 'map-container');
                }
              },
            });
          }
        }
      }
    }

    // $(view).appendTo($(container))

    if (!question.is_sub_question) {
      $(view).appendTo($(container));
    } else {
      // remove sub questions because we will re-add them with completed answers
      let option_element = $(container).find('tr.questionOption')[question.answer_index];
      if ($(option_element).next().hasClass('subQuestion')) $(option_element).next().remove();
      $(view).insertAfter($(option_element));
    }
  }

  // getResponse() {
  //
  //     let response = "";
  //     if (this.responseStrings) {
  //         for (let str of this.responseStrings) {
  //             if (str) response += this.responseStrings;
  //         }
  //     }
  //     return (response) ? response : "";
  // }
}
class DateTime extends NumberField {
  constructor(metadata, parent_template, question_num, template_question_num, section, is_new, parent_question, answer_index) {
    super(metadata, parent_template, question_num, template_question_num, section, is_new, parent_question, answer_index);

    this.scroll_icon_src = 'lib/images/icons/icon-date-46x46.png';
    this.scroll_icon_error_src = 'lib/images/icons/icon-date-error-46x46.png';
    $(this.scroll_icon).find('img').attr('src', this.scroll_icon_src);
    $(this.reorder_list_item).find('img').attr('src', this.scroll_icon_src);

    let datetime = this;

    let mode_selector = DOM.new({
      tag: 'div',
      class: 'modeSelector',
      children: [
        {
          tag: 'div',
          class: 'modeOption',
          html: 'Date',
          click: function () {
            datetime.setMode('date');
          },
        },
        {
          tag: 'div',
          class: 'modeOption',
          html: 'Time',
          click: function () {
            datetime.setMode('time');
          },
        },
      ],
    });

    $(this.edit_question_DOM).find('.modeSelector').remove();
    $(mode_selector).insertAfter($(this.edit_question_DOM).find('.questionType'));
    if (!this.mode || this.mode === 'integer') this.mode = 'date';

    this.setMode(this.mode);
  }

  setMode(mode) {
    let textarea_class;
    let option_index;
    let label;
    this.mode = mode;
    this.metadata.mode = mode;

    switch (mode) {
      case 'date': {
        label = this.label === 'Please enter a time' ? 'Please enter a date' : this.label ? this.label : '';
        this.scroll_icon_src = 'lib/images/icons/icon-date-46x46.png';
        this.scroll_icon_error_src = 'lib/images/icons/icon-date-error-46x46.png';
        textarea_class = 'numberField';
        option_index = 0;
        break;
      }

      case 'time': {
        label = this.label === 'Please enter a date' ? 'Please enter a time' : this.label ? this.label : '';
        this.scroll_icon_src = 'lib/images/icons/icon-time-46x46.png';
        this.scroll_icon_error_src = 'lib/images/icons/icon-time-error-46x46.png';
        textarea_class = 'numberField';
        option_index = 1;
        break;
      }
    }

    textarea_class += ' textFieldPlaceHolder';
    $(this.edit_question_DOM).find('.textFieldPlaceHolder').attr('class', textarea_class);
    $(this.view_question_DOM).find('.textFieldPlaceHolder').attr('class', textarea_class);
    $(this.edit_question_DOM).find('.modeSelector').children('.toggled').removeClass('toggled');
    $($(this.edit_question_DOM).find('.modeOption')[option_index]).addClass('toggled');

    this.label = label;

    $(this.edit_question_DOM).find('.shortAnswer').val(label);
    $(this.view_question_DOM).find('.questionText').html(label);
    $(this.view_question_DOM).find('.questionType').html(Utils.capitalize(this.mode));

    $(this.scroll_icon).find('img').attr('src', this.scroll_icon_src);
    $(this.reorder_list_item).find('img').attr('src', this.scroll_icon_src);

    if (!this.required || !this.hasOwnProperty('required')) $(this.view_question_DOM).find('.optionsWrapper').hide();

    // this.updateEmptyFields();
    this.parent_template.save();
  }
}

//special question types
class LocationField extends Question {
  constructor(metadata, parent_template, question_num, template_question_num, section, is_new, parent_question, answer_index) {
    super(metadata, parent_template, question_num, template_question_num, section, is_new, parent_question, answer_index);

    this.scroll_icon_src = 'lib/images/icons/icon-location-46x46.png';
    this.scroll_icon_error_src = 'lib/images/icons/icon-location-error-46x46.png';
    $(this.scroll_icon).find('img').attr('src', this.scroll_icon_src);
    $(this.reorder_list_item).find('img').attr('src', this.scroll_icon_src);

    let text_field = this;

    let instruction_class = 'instructionText';
    if (!this.instructions) instruction_class += ' hidden';

    this.view_question_DOM = DOM.new({
      tag: 'div',
      class: 'questionWrapper',
      children: [
        { tag: 'p', class: 'questionNumber', html: 'Q' + template_question_num },
        {
          tag: 'div',
          class: 'optionsWrapper',
          children: [{ tag: 'p', class: 'editFieldLabel inline boldText redText', html: 'Required' }],
        },
        { tag: 'p', class: 'questionType', html: this.type },
        { tag: 'p', class: 'headingText', html: this.heading },
        { tag: 'p', class: 'questionText', html: this.label },
        { tag: 'p', class: instruction_class, html: this.instructions },
        {
          tag: 'div',
          class: 'wrapper alignLeft',
          children: [
            { tag: 'div', class: 'editModeMap locationMapContainer', children: [{ tag: 'div', class: 'mapSelectionIcon' }] },
            { tag: 'p', class: 'locationQuestionDetails inline', html: 'Lat' },
            { tag: 'input', class: 'locationLatLon' },
            { tag: 'p', class: 'locationQuestionDetails inline', html: 'Lon' },
            { tag: 'input', class: 'locationLatLon' },
            { tag: 'p', class: 'editFieldLabel', html: 'Address' },
            { tag: 'textarea', class: 'locationAddress' },
          ],
        },
        {
          tag: 'div',
          class: 'wrapper',
          children: [{ tag: 'div', class: 'buttonDecline disabled hidden positionLeft', html: 'Prefer not to answer' }],
        },
      ],
    });

    if (!this.heading) $(this.view_question_DOM).find('p.headingText').addClass('hidden');

    this.edit_question_DOM = DOM.new({
      tag: 'div',
      class: 'questionWrapper',
      children: [
        { tag: 'p', class: 'questionNumber', html: 'Q' + template_question_num },
        this.getRequiredSelector(),
        { tag: 'div', class: 'modeSelector', children: [{ tag: 'div', class: 'modeOption toggled', html: this.type }] },
        text_field.getHeadingField(),
        text_field.getQuestionField(),
        text_field.getInstructionField(),

        {
          tag: 'div',
          class: 'wrapperExtraTopPad alignLeft',
          children: [
            { tag: 'div', class: 'mapSelectionIcon' },
            { tag: 'div', class: 'editModeMap locationMapContainer', children: [{ tag: 'div', class: 'mapSelectionIcon' }] },
            { tag: 'p', class: 'locationQuestionDetails inline', html: 'Lat' },
            { tag: 'input', class: 'locationLatLon' },
            { tag: 'p', class: 'locationQuestionDetails inline', html: 'Lon' },
            { tag: 'input', class: 'locationLatLon' },
            { tag: 'p', class: 'editFieldLabel', html: 'Address' },
            { tag: 'textarea', class: 'locationAddress' },
          ],
        },

        text_field.addDeclineOptionRow(),
        {
          tag: 'div',
          class: 'wrapperExtraTopPad',
          children: [
            {
              tag: 'button',
              class: 'buttonDeleteQuestion',
              label: 'Delete Question',
              up_action: function () {
                text_field.getDeleteQuestionForm();
              },
            },
          ],
        },
      ],
    });

    if (is_new) {
      //add new question to template
      if (!parent_template.edit_mode) parent_template.toggleView();
      let new_question = parent_template.edit_mode ? $(this.edit_question_DOM) : $(this.view_question_DOM);
      $('#questionnaire-view-template').children().not('.newQuestionModalForm').remove();
      $(new_question).appendTo($('#questionnaire-view-template'));
      $('.questionScrollIcon, .headerScrollIcon, .sectionScrollIcon, .sectionScrollContainer').removeClass('iconActive');
      $(this.scroll_icon).addClass('iconActive');
      parent_template.updateItemCount();
    } else if (parent_question && answer_index > -1) {
      this.edit_question_DOM = DOM.new({
        tag: 'div',
        class: 'subQuestion',
        children: [
          text_field.getQuestionField(),
          { tag: 'div', class: 'wrapperExtraTopPad', children: [{ tag: 'textarea', class: 'shortAnswer textFieldPlaceHolder' }] },
        ],
      });

      this.view_question_DOM = DOM.new({
        tag: 'div',
        class: 'questionWrapper subQuestion indent',
        children: [
          { tag: 'p', class: 'questionText smallText', html: this.label },
          { tag: 'div', class: 'wrapper centerText', children: [{ tag: 'textarea', class: 'shortAnswer textFieldPlaceHolder' }] },
        ],
      });

      let view_field = $($(parent_question.view_question_DOM).find('.questionOption')[answer_index]);
      let edit_field = $($(parent_question.edit_question_DOM).find('.questionOption')[answer_index]);

      $(this.view_question_DOM).insertAfter($(view_field));
      $(this.edit_question_DOM).appendTo($(edit_field));

      $($(parent_question.edit_question_DOM).find('.buttonAddSubQuestion')[answer_index]).addClass('hidden');
      $($(parent_question.edit_question_DOM).find('.buttonDeleteSubQuestion')[answer_index]).removeClass('hidden');

      parent_question.options[answer_index].sub_question = this.metadata;
      // parent_template.updateItemCount();
    }

    $(this.branching_icon).find('img').attr('src', this.scroll_icon_src);
    if (this.decline) this.addDeclineOption(this.decline);
    this.updateEmptyFields();
    this.initMap();
  }

  showQuestionFlowPanel(e) {
    super.showQuestionFlowPanel(e);

    // console.log($(e.target))
    //
    // if (e) {
    //
    //     if (e.type === "mouseover") {
    //         if ($(e.target).hasClass("branch-node-selected")) {
    //
    //             console.log("returning")
    //             return;
    //         }
    //     }
    // }

    let question_flow_map_canvas = $('.question-flow-info-panel').find('.locationMapContainer .mapCanvas');
    question_flow_map_canvas.remove();

    question_flow_map_canvas = DOM.new({
      tag: 'div',
      class: 'mapCanvas',
      parent: $('.question-flow-info-panel').find('.locationMapContainer'),
    });

    this.question_flow_map = L.map(question_flow_map_canvas).setView([47.6468, -122.3353], 16);
    L.tileLayer(Map.basemaps['satellite']['url']).addTo(this.question_flow_map);

    //
    // // //tile hack
    // (function(){
    //     let originalInitTile = L.GridLayer.prototype._initTile;
    //     L.GridLayer.include({
    //         _initTile: function (tile) {
    //             originalInitTile.call(this, tile);
    //
    //             let tileSize = this.getTileSize();
    //
    //             tile.style.width = tileSize.x + 1 + "px";
    //             tile.style.height = tileSize.y + 1 + "px";
    //         }
    //     });
    // })();
    //
    // this.question_flow_map.invalidateSize();
  }

  addDeclineOptionRow() {
    let question = this;
    let parent_template = question.parent_template;

    // if (!question.decline) {
    //     question.decline = {label: "Prefer not to answer"};
    // } else {
    //     if (!question.decline.label) {
    //         question.decline = {label: "Prefer not to answer"};
    //     }
    // }

    let decline_option = {
      tag: 'div',
      class: 'declineOption hidden',
      children: [
        {
          tag: 'div',
          class: 'declineOptionWrapper',
          children: [
            { tag: 'p', class: 'declineLabel', html: 'Decline Option' },
            {
              tag: 'button',
              style: ['MultipleChoiceBubble', 'removableAnswer'],
              label: SVG.getBlackCloseOutIcon(),
              click: removeDecline,
            },
            {
              tag: 'textarea',
              class: 'optionField',
              rows: 1,
              keyup: function () {
                if (parent_template.update_timer !== null) clearTimeout(parent_template.update_timer);
                let input = $(this);
                parent_template.update_timer = setTimeout(function () {
                  question.decline = { label: $(input).val().trim() };
                  // question.metadata.decline.label = question.decline.label;
                  $($(question.view_question_DOM).find('.buttonDecline')).html(question.decline.label);
                  $($(question.view_question_DOM).find('.buttonDecline')).removeClass('hidden');
                  parent_template.save();
                }, 250);
              },
              input: function () {
                //resize field on input
                $(this).outerHeight(this.scrollHeight);
              },
            },
          ],
        },
      ],
    };

    function addDecline() {
      question.addDeclineOption();
    }

    function removeDecline() {
      question.decline = null;

      // $($(multi_text.edit_question_DOM).find(".addDeclineOptionWrapper")[DOM_index]).children(".buttonAddAnswer").html(SVG.getBlackCloseOutIcon())
      $($(question.edit_question_DOM).find('.addDeclineOptionWrapper')).children('.declineOption').addClass('hidden');
      $($(question.edit_question_DOM).find('.addDeclineOptionWrapper'))
        .children('p.addNewOptionLabel, .buttonAddAnswer')
        .removeClass('hidden');

      //decline with always be last option
      $($(question.view_question_DOM).find('.buttonDecline')).addClass('hidden');
      question.parent_template.save();
    }

    return {
      tag: 'div',
      class: 'addDeclineOptionWrapper',
      children: [
        { tag: 'button', label: SVG.getBlackPlusSign(), style: ['buttonAddAnswer'], click: addDecline },
        { tag: 'p', class: 'addNewOptionLabel', html: 'Add Decline Option', click: addDecline },
        decline_option,
      ],
    };
  }

  addDeclineOption() {
    let question = this;
    let parent_template = question.parent_template;

    if (!question.decline) {
      question.decline = { label: 'Prefer not to answer' };
    } else {
      if (!question.decline.label) question.decline = { label: 'Prefer not to answer' };
    }

    $($(question.view_question_DOM).find('.buttonDecline')).html(question.decline.label);
    $($(question.view_question_DOM).find('.buttonDecline')).removeClass('hidden');

    // $($(question.edit_question_DOM).find(".declineButtonInput")[DOM_index]).val(question.decline.label);

    $($(question.edit_question_DOM).find('.optionField')).val(question.decline.label);

    // $($(question.edit_question_DOM).find(".declineButtonInput")[DOM_index]).removeClass("hidden");

    // $($(question.edit_question_DOM).find(".addDeclineOptionWrapper")[DOM_index]).children(".buttonAddAnswer").html(SVG.getBlackCloseOutIcon())
    $($(question.edit_question_DOM).find('.addDeclineOptionWrapper')).children('.declineOption').removeClass('hidden');
    $($(question.edit_question_DOM).find('.addDeclineOptionWrapper'))
      .children('p.addNewOptionLabel, .buttonAddAnswer')
      .addClass('hidden');

    // $($(question.edit_question_DOM).find(".addDeclineOptionWrapper")[DOM_index]).addClass("unclickable");

    //
    // $($(question.edit_question_DOM).find(".addDeclineOptionWrapper")[DOM_index]).children("p.addNewOptionLabel").addClass("hidden");
    // $($(question.edit_question_DOM).find(".addDeclineOptionWrapper")[DOM_index]).children("p.editFieldLabel").removeClass("hidden");

    question.parent_template.save();
  }

  initMap(map_type) {
    let view_mode_map_canvas = DOM.new({
      tag: 'div',
      class: 'mapCanvas',
      parent: $(this.view_question_DOM).find('.locationMapContainer'),
    });
    let edit_mode_map_canvas = DOM.new({
      tag: 'div',
      class: 'mapCanvas',
      parent: $(this.edit_question_DOM).find('.locationMapContainer'),
    });

    this.view_mode_map = L.map(view_mode_map_canvas).setView([47.6468, -122.3353], 16);
    this.edit_mode_map = L.map(edit_mode_map_canvas).setView([47.6468, -122.3353], 16);

    L.tileLayer(Map.basemaps['satellite']['url']).addTo(this.view_mode_map);
    L.tileLayer(Map.basemaps['satellite']['url']).addTo(this.edit_mode_map);

    //tile hack
    (function () {
      let originalInitTile = L.GridLayer.prototype._initTile;
      L.GridLayer.include({
        _initTile: function (tile) {
          originalInitTile.call(this, tile);

          let tileSize = this.getTileSize();

          tile.style.width = tileSize.x + 1 + 'px';
          tile.style.height = tileSize.y + 1 + 'px';
        },
      });
    })();

    this.view_mode_map.invalidateSize();
    this.edit_mode_map.invalidateSize();

    if (!this.required || !this.hasOwnProperty('required')) $(this.view_question_DOM).find('.optionsWrapper').hide();
  }

  getResponse() {
    let response = '';
    if (this.responseStrings) {
      if (this.responseStrings.length === 3) {
        //check for decline
        if (!this.responseStrings[0] && !this.responseStrings[1]) return this.decline.label;

        response += 'Lat: ';
        if (this.responseStrings[0]) response += Number.parseFloat(this.responseStrings[0]).toFixed(6) + '<br>';
        response += 'Lon: ';
        if (this.responseStrings[1]) response += Number.parseFloat(this.responseStrings[1]).toFixed(6) + '<br><br>';
        if (this.responseStrings[2]) response += this.responseStrings[2];
      } else {
        for (let string of this.responseStrings) response += string + ' ';
        response = response.substring(0, response.length - 1);
      }
    }
    return response;
  }

  drawEditableResponse(container) {
    super.drawEditableResponse();

    let response_timer = null;
    let question = this;
    let view = $(this.asset_edit_view);

    $(view).find('.mapCanvas').remove();

    let edit_mode_map_canvas = DOM.new({ tag: 'div', class: 'mapCanvas', parent: $(view).find('.locationMapContainer') });

    let lat = question.responseStrings[0] ? question.responseStrings[0] : 47.6468;
    let lon = question.responseStrings[1] ? question.responseStrings[1] : -122.3353;

    let editable_map = L.map(edit_mode_map_canvas).setView([lat, lon], 16);

    L.tileLayer(Map.basemaps['satellite']['url']).addTo(editable_map);

    //tile hack
    (function () {
      let originalInitTile = L.GridLayer.prototype._initTile;
      L.GridLayer.include({
        _initTile: function (tile) {
          originalInitTile.call(this, tile);

          let tileSize = this.getTileSize();

          tile.style.width = tileSize.x + 1 + 'px';
          tile.style.height = tileSize.y + 1 + 'px';
        },
      });
    })();

    editable_map.invalidateSize();

    DOM.new({
      tag: 'div',
      class: 'button-change-map',
      parent: $(view).find('.locationMapContainer'),
      html: 'Change',
      click: function () {
        if ($(view).find('.locationMapContainer').hasClass('editable-map')) {
          $(this).html('Change');
          $(view).find('.locationMapContainer').removeClass('editable-map');
          $(this).removeClass('button-end-change-map ');
        } else {
          $(this).addClass('button-end-change-map ');
          $(view).find('.locationMapContainer').addClass('editable-map');
          $(this).html('End');
        }
      },
    });

    DOM.new({ tag: 'div', class: 'editable-map-vert-line', parent: $(view).find('.locationMapContainer') });
    DOM.new({ tag: 'div', class: 'editable-map-horiz-line', parent: $(view).find('.locationMapContainer') });

    if (question.responseStrings.length === 3) {
      $($(view).find('input.locationLatLon')[0]).val(question.responseStrings[0]);
      $($(view).find('input.locationLatLon')[1]).val(question.responseStrings[1]);
      $($(view).find('textarea.locationAddress')).html(question.responseStrings[2]);
    }

    $(view).appendTo($(container));
    editable_map.invalidateSize();
    window.dispatchEvent(new Event('resize'));

    editable_map.on('moveend', function () {
      let pos = editable_map.getCenter();

      $.get('https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=' + pos.lat + '&lon=' + pos.lng, function (data) {
        let address =
          data.address.house_number +
          ' ' +
          data.address.road +
          ', ' +
          data.address.city +
          ', ' +
          data.address.state +
          ' ' +
          data.address.postcode +
          ' ' +
          data.address.country;
        $($(view).find('textarea.locationAddress')).html(address);
        question.responseStrings = [pos.lat, pos.lng, address];
      });

      $($(view).find('input.locationLatLon')[0]).val(pos.lat);
      $($(view).find('input.locationLatLon')[1]).val(pos.lng);
    });

    editable_map.addEventListener('click', (event) => {
      let lat = Math.round(event.latlng.lat * 100000) / 100000;
      let lng = Math.round(event.latlng.lng * 100000) / 100000;

      $.get('https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=' + lat + '&lon=' + lng, function (data) {
        let address =
          data.address.house_number +
          ' ' +
          data.address.road +
          ', ' +
          data.address.city +
          ', ' +
          data.address.state +
          ' ' +
          data.address.postcode +
          ' ' +
          data.address.country;
        $($(view).find('textarea.locationAddress')).html(address);

        question.responseStrings = [lat, lng, address];
        editable_map.panTo(new L.LatLng(lat, lng));
      });

      $($(view).find('input.locationLatLon')[0]).val(lat);
      $($(view).find('input.locationLatLon')[1]).val(lng);
    });

    $($(view).find('textarea.locationAddress')).html(question.responseStrings[2]);
  }

  drawViewResponse(container) {
    super.drawViewResponse();

    let response_timer = null;
    let question = this;
    let parent_template = question.parent_template;
    let view = $(this.asset_view_view);

    $(view).find('.mapCanvas').remove();

    let view_mode_map_canvas = DOM.new({ tag: 'div', class: 'mapCanvas', parent: $(view).find('.locationMapContainer') });

    let lat = question.responseStrings[0] ? question.responseStrings[0] : 47.6468;
    let lon = question.responseStrings[1] ? question.responseStrings[1] : -122.3353;

    let view_map = L.map(view_mode_map_canvas).setView([lat, lon], 16);

    L.tileLayer(Map.basemaps['satellite']['url']).addTo(view_map);

    DOM.new({
      tag: 'div',
      class: 'button-change-map',
      parent: $(view).find('.locationMapContainer'),
      html: 'Change',
      click: function () {
        if ($(view).find('.locationMapContainer').hasClass('editable-map')) {
          $(this).html('Change');
          $(view).find('.locationMapContainer').removeClass('editable-map');
          $(this).removeClass('button-end-change-map ');
        } else {
          $(this).addClass('button-end-change-map ');
          $(view).find('.locationMapContainer').addClass('editable-map');
          $(this).html('End');
        }
      },
    });

    DOM.new({ tag: 'div', class: 'editable-map-vert-line', parent: $(view).find('.locationMapContainer') });
    DOM.new({ tag: 'div', class: 'editable-map-horiz-line', parent: $(view).find('.locationMapContainer') });

    if (question.responseStrings.length === 3) {
      $($(view).find('input.locationLatLon')[0]).val(question.responseStrings[0]);
      $($(view).find('input.locationLatLon')[1]).val(question.responseStrings[1]);
      $($(view).find('textarea.locationAddress')).html(question.responseStrings[2]);
    }

    $(view).appendTo($(container));
    view_map.invalidateSize();
    window.dispatchEvent(new Event('resize'));

    $($(view).find('textarea.locationAddress')).html(question.responseStrings[2]);

    if (question.hasOwnProperty('assetUuids')) {
      if (question.assetUuids) {
        if (question.assetUuids.length) {
          for (let uuid of question.assetUuids) {
            let asset = Assets.getAsset(uuid);

            // todo write parameters function to provide host and protocol
            let url =
              Parameters.deployment === 'live'
                ? 'https://rapid.apl.uw.edu' + asset.file_url
                : 'https://rapid2.apl.uw.edu' + asset.file_url;

            DOM.new({
              tag: 'img',
              class: 'embeddedAssetViewImg',
              src: url,
              parent: container,
              children: [
                {
                  tag: 'button',
                  class: 'view-embedded-asset-icon',
                  label: SVG.getEyeIcon(),
                  style: ['buttonEditItems', 'margin10'],
                  up_action: function () {
                    parent_template.getEmbeddedAssetViewer(question.id, uuid, 'map-container');
                  },
                },
              ],
              click: function () {
                // check for map view embedded asset element
                if ($('#map-info-panel .embeddedAssetViewImg').length) {
                  parent_template.getEmbeddedAssetViewer(question.id, uuid, 'map-container');
                }
              },
            });
          }
        }
      }
    }
  }

  // getAssetViewerTableCell() {
  //
  //     let question = this
  //     let questionnaire = this.parent_template
  //
  //     questionnaire.table_cells.push(
  //         {tag: "td", class: "multi-text-cell location-cell", children: [
  //                 {tag: "button", label: SVG.getPencilSmall(), style: ["buttonEditItems", "button-edit-question"], up_action: function () {
  //                         questionnaire.editCompletedQuestionnaire(question.id);
  //                     }
  //                 },
  //                 {tag: "div", children: [
  //                         {tag: "p", html: question.getResponse()}
  //                     ]},
  //             ]})
  // }
}
class RangeAnswer2 extends Question {
  constructor(metadata, parent_template, question_num, template_question_num, section, is_new, parent_question, answer_index) {
    super(metadata, parent_template, question_num, template_question_num, section, is_new, parent_question, answer_index);

    this.scroll_icon_src = 'lib/images/icons/icon-range-46x46.png';
    this.scroll_icon_error_src = 'lib/images/icons/icon-range-error-46x46.png';
    $(this.scroll_icon).find('img').attr('src', this.scroll_icon_src);
    $(this.reorder_list_item).find('img').attr('src', this.scroll_icon_src);

    let range = this;
    let max = range.range.max;
    range.update_timer = null;

    let range_answers = [];

    let display_class = 'rangeAnswer';
    for (let k = 0; k < max; k++) {
      if (k + 1 === 10) display_class = 'rangeAnswerDoubleDigit';
      range_answers.push({ tag: 'button', style: ['rangeAnswer'], children: [{ tag: 'p', class: display_class, html: k + 1 }] });
    }

    let instruction_class = 'instructionText';

    if (!this.instructions) instruction_class += ' hidden';

    this.view_question_DOM = DOM.new({
      tag: 'div',
      class: 'questionWrapper',
      children: [
        { tag: 'p', class: 'questionNumber', html: 'Q' + this.template_question_num },
        {
          tag: 'div',
          class: 'optionsWrapper',
          children: [{ tag: 'p', class: 'editFieldLabel inline boldText redText', html: 'Required' }],
        },
        { tag: 'p', class: 'questionType', html: this.type },
        { tag: 'p', class: 'headingText', html: this.heading },
        { tag: 'p', class: 'questionText', html: this.label },
        { tag: 'p', class: instruction_class, html: this.instructions },
        {
          tag: 'div',
          class: 'wrapper centerText rangeAnswers',
          children: [{ tag: 'div', class: 'wrapper', children: range_answers }],
        },
        {
          tag: 'div',
          class: 'wrapper',
          children: [{ tag: 'div', class: 'buttonDecline disabled hidden', html: 'Prefer not to answer' }],
        },
      ],
    });

    if (!this.heading) $(this.view_question_DOM).find('p.headingText').addClass('hidden');

    this.edit_question_DOM = DOM.new({
      tag: 'div',
      class: 'questionWrapper',
      children: [
        { tag: 'p', class: 'questionNumber', html: 'Q' + this.template_question_num },
        this.getRequiredSelector(),
        { tag: 'div', class: 'modeSelector', children: [{ tag: 'div', class: 'modeOption toggled', html: this.type }] },
        range.getHeadingField(),
        range.getQuestionField(),
        range.getInstructionField(),

        {
          tag: 'div',
          class: 'wrapper centerText',
          children: [
            { tag: 'div', class: 'wrapper rangeAnswers', children: range_answers },
            {
              tag: 'div',
              class: 'numAnswersWrapper',
              children: [
                { tag: 'p', class: 'inline blackText', html: 'Enter number of options:' },
                { tag: 'input', class: 'RangeAnswerField', value: max },
              ],
            },
          ],
        },
        range.addDeclineOptionRow(),
        {
          tag: 'div',
          class: 'wrapperExtraTopPad',
          children: [
            {
              tag: 'button',
              class: 'buttonDeleteQuestion',
              label: 'Delete Question',
              up_action: function () {
                range.getDeleteQuestionForm();
              },
            },
          ],
        },
      ],
    });

    if (is_new) {
      //add new question to template
      if (!parent_template.edit_mode) parent_template.toggleView();
      let new_question = parent_template.edit_mode ? $(this.edit_question_DOM) : $(this.view_question_DOM);
      $('#questionnaire-view-template').children().not('.newQuestionModalForm').remove();
      $(new_question).appendTo($('#questionnaire-view-template'));
      $('.questionScrollIcon, .headerScrollIcon, .sectionScrollIcon, .sectionScrollContainer').removeClass('iconActive');
      $(this.scroll_icon).addClass('iconActive');
      parent_template.updateItemCount();
    } else if (parent_question) {
      range.is_sub_question = true;
      this.parent_question = parent_question;

      this.edit_question_DOM = DOM.new({
        tag: 'div',
        class: 'questionWrapper indentLarge subQuestion',
        children: [
          { tag: 'p', class: 'questionNumber', html: this.getSubQuestionNumber() },
          range.getQuestionField(),
          {
            tag: 'div',
            class: 'wrapper centerText',
            children: [
              { tag: 'div', class: 'wrapper rangeAnswers', children: range_answers },
              {
                tag: 'div',
                class: 'numAnswersWrapper',
                children: [
                  { tag: 'p', class: 'inline blackText', html: 'Enter number of options:' },
                  { tag: 'input', class: 'RangeAnswerField', value: max },
                ],
              },
            ],
          },
        ],
      });

      this.view_question_DOM = DOM.new({
        tag: 'div',
        class: 'questionWrapper indent subQuestion',
        children: [
          { tag: 'p', class: 'questionNumber', html: this.getSubQuestionNumber() },
          { tag: 'p', class: 'questionText smallText', html: this.label },
          {
            tag: 'div',
            class: 'wrapper centerText',
            children: [{ tag: 'div', class: 'wrapper rangeAnswers', children: range_answers }],
          },
        ],
      });

      if (answer_index > -1) {
        let view_field = $(
          $(parent_question.view_question_DOM).find('.questionnaireOptions ').children('.questionOption')[answer_index]
        );
        // let edit_field = $($(parent_question.edit_question_DOM).children(".questionOption")[answer_index]);

        let edit_field = $(
          $(parent_question.edit_question_DOM).children('.question-edit-field-container').find('.questionOption')[answer_index]
        );

        $(this.view_question_DOM).insertAfter($(view_field));
        $(this.edit_question_DOM).appendTo($(edit_field));

        $(this.view_question_DOM).find('.questionOption').removeClass('questionOption').addClass('questionnaireSubOption');
        $(this.view_question_DOM).find('.questionnaireOptions').removeClass('questionnaireOptions').addClass('subQuestionOptions');

        $($(parent_question.edit_question_DOM).find('.buttonAddSubQuestion')[answer_index]).addClass('hidden');
        $($(parent_question.edit_question_DOM).find('.buttonDeleteSubQuestion')[answer_index]).removeClass('hidden');

        parent_question.options[answer_index].sub_question = this.metadata;
        // parent_template.updateItemCount();
      } else if (answer_index === -1) {
        this.is_decline_sub_question = true;

        parent_question.decline.sub_question = this.metadata;

        this.view_question_DOM = DOM.new({ tag: 'div', class: 'questionWrapper subQuestion indent' });

        $(this.edit_question_DOM).find('.goToMenuButton, .buttonAddSubQuestion, .buttonDeleteSubQuestion').remove();
        $(this.edit_question_DOM).find('.questionOption').removeClass('questionOption');

        let view_field = $(
          $(parent_question.view_question_DOM)
            .children('.dropDownViewModeContainer')
            .children('.questionnaireOptions')
            .children('.questionOption')
            .last()
        );
        let edit_field = $($(parent_question.edit_question_DOM).children('.declineOption'));

        $(this.view_question_DOM).insertAfter($(view_field));
        $(this.edit_question_DOM).appendTo($(edit_field));

        $(this.view_question_DOM).find('.questionOption').removeClass('questionOption').addClass('questionnaireSubOption');
        $(this.view_question_DOM).find('.questionnaireOptions').removeClass('questionnaireOptions').addClass('subQuestionOptions');

        $($(edit_field).find('.buttonAddSubQuestion')).addClass('hidden');
        $($(edit_field).find('.buttonDeleteSubQuestion')).removeClass('hidden');

        // parent_template.updateItemCount();
      }
    }

    $(range.edit_question_DOM).find('.RangeAnswerField').unbind();
    $(range.edit_question_DOM)
      .find('.RangeAnswerField')
      .keydown(function (e) {
        if (!Utils.numberChars.includes(e.which) || e.shiftKey) e.preventDefault();
      });

    this.updateRangeEvents();

    if (!this.required || !this.hasOwnProperty('required')) $(this.view_question_DOM).find('.optionsWrapper').hide();

    $(this.branching_icon).find('img').attr('src', this.scroll_icon_src);
    if (this.decline) this.addDeclineOption(this.decline);
    this.inspectErrors();
  }

  updateAnswerCount(num) {
    //less 11 options, greater than 2 options
    num = num >= 10 ? 10 : num <= 3 ? 3 : num;

    $(this.view_question_DOM).find('.rangeAnswers').empty();
    $(this.edit_question_DOM).find('.rangeAnswers').empty();

    let display_class = 'rangeAnswer';

    for (let k = 0; k < num; k++) {
      if (k + 1 === 10) display_class = 'rangeAnswerDoubleDigit';
      let answer = DOM.new({ tag: 'button', style: ['rangeAnswer'], children: [{ tag: 'p', class: display_class, html: k + 1 }] });
      $(answer).appendTo($(this.edit_question_DOM).find('.rangeAnswers'));
      $(answer).clone().appendTo($(this.view_question_DOM).find('.rangeAnswers'));
    }

    $(this.edit_question_DOM).find('.RangeAnswerField').val(num);
    $(this.edit_question_DOM).find('.RangeAnswerField').html(num);

    this.range.max = num;
    this.parent_template.save();
  }

  updateRangeEvents() {
    let range = this;

    $(range.edit_question_DOM)
      .find('.RangeAnswerField')
      .keypress(function (e) {
        let answer_field = $(this);
        if ($(this).val()) {
          clearTimeout(range.update_timer);
          range.update_timer = setTimeout(function () {
            let num = $(answer_field).val();
            if (num) range.updateAnswerCount(num);
          }, 750);
        }
      });

    $(range.edit_question_DOM)
      .find('.RangeAnswerField')
      .blur(function () {
        let answer_field = $(this);
        clearTimeout(range.update_timer);
        range.update_timer = setTimeout(function () {
          let num = $(answer_field).val() ? $(answer_field).val() : 10;
          if (num) range.updateAnswerCount(num);
        }, 500);
      });
  }

  addDeclineOptionRow() {
    let question = this;
    let parent_template = question.parent_template;

    // if (!question.decline) {
    //     question.decline = {label: "Prefer not to answer"};
    // } else {
    //     if (!question.decline.label) {
    //         question.decline = {label: "Prefer not to answer"};
    //     }
    // }

    let decline_option = {
      tag: 'div',
      class: 'declineOption hidden',
      children: [
        {
          tag: 'div',
          class: 'declineOptionWrapper',
          children: [
            { tag: 'p', class: 'declineLabel', html: 'Decline Option' },
            {
              tag: 'button',
              style: ['MultipleChoiceBubble', 'removableAnswer'],
              label: SVG.getBlackCloseOutIcon(),
              click: removeDecline,
            },
            {
              tag: 'textarea',
              class: 'optionField',
              rows: 1,
              keyup: function () {
                if (parent_template.update_timer !== null) clearTimeout(parent_template.update_timer);
                let input = $(this);
                parent_template.update_timer = setTimeout(function () {
                  question.decline = { label: $(input).val().trim() };
                  // question.metadata.decline.label = question.decline.label;
                  $($(question.view_question_DOM).find('.buttonDecline')).html(question.decline.label);
                  $($(question.view_question_DOM).find('.buttonDecline')).removeClass('hidden');
                  parent_template.save();
                }, 250);
              },
              input: function () {
                //resize field on input
                $(this).outerHeight(this.scrollHeight);
              },
            },
          ],
        },
      ],
    };

    function addDecline() {
      question.addDeclineOption();
    }

    function removeDecline() {
      question.decline = null;

      // $($(multi_text.edit_question_DOM).find(".addDeclineOptionWrapper")[DOM_index]).children(".buttonAddAnswer").html(SVG.getBlackCloseOutIcon())
      $($(question.edit_question_DOM).find('.addDeclineOptionWrapper')).children('.declineOption').addClass('hidden');
      $($(question.edit_question_DOM).find('.addDeclineOptionWrapper'))
        .children('p.addNewOptionLabel, .buttonAddAnswer')
        .removeClass('hidden');

      //decline with always be last option
      $($(question.view_question_DOM).find('.buttonDecline')).addClass('hidden');
      question.parent_template.save();
    }

    return {
      tag: 'div',
      class: 'addDeclineOptionWrapper',
      children: [
        { tag: 'button', label: SVG.getBlackPlusSign(), style: ['buttonAddAnswer'], click: addDecline },
        { tag: 'p', class: 'addNewOptionLabel', html: 'Add Decline Option', click: addDecline },
        decline_option,
      ],
    };
  }

  addDeclineOption() {
    let question = this;
    let parent_template = question.parent_template;

    if (!question.decline) {
      question.decline = { label: 'Prefer not to answer' };
    } else {
      if (!question.decline.label) question.decline = { label: 'Prefer not to answer' };
    }

    $($(question.view_question_DOM).find('.buttonDecline')).html(question.decline.label);
    $($(question.view_question_DOM).find('.buttonDecline')).removeClass('hidden');

    // $($(question.edit_question_DOM).find(".declineButtonInput")[DOM_index]).val(question.decline.label);

    $($(question.edit_question_DOM).find('.optionField')).val(question.decline.label);

    // $($(question.edit_question_DOM).find(".declineButtonInput")[DOM_index]).removeClass("hidden");

    // $($(question.edit_question_DOM).find(".addDeclineOptionWrapper")[DOM_index]).children(".buttonAddAnswer").html(SVG.getBlackCloseOutIcon())
    $($(question.edit_question_DOM).find('.addDeclineOptionWrapper')).children('.declineOption').removeClass('hidden');
    $($(question.edit_question_DOM).find('.addDeclineOptionWrapper'))
      .children('p.addNewOptionLabel, .buttonAddAnswer')
      .addClass('hidden');

    // $($(question.edit_question_DOM).find(".addDeclineOptionWrapper")[DOM_index]).addClass("unclickable");

    //
    // $($(question.edit_question_DOM).find(".addDeclineOptionWrapper")[DOM_index]).children("p.addNewOptionLabel").addClass("hidden");
    // $($(question.edit_question_DOM).find(".addDeclineOptionWrapper")[DOM_index]).children("p.editFieldLabel").removeClass("hidden");

    question.parent_template.save();
  }

  getResponse() {
    let response = null;

    // console.log(this.responseIndexes)
    if (this.hasOwnProperty('responseIndexes')) {
      if (this.responseIndexes != null) {
        if (this.responseIndexes.length) {
          if (this.responseIndexes[0] === this.range.max) return this.decline.label;
          response = this.responseIndexes[0] + 1;
        }
      }
    }

    return response > -1 ? response : '';
  }

  drawEditableResponse(container) {
    super.drawEditableResponse();

    let question = this;
    let view = $(this.view_question_DOM);

    $(
      $(view)
        .find('div.rangeAnswer')
        .click(function () {
          $(view).find('div.rangeAnswer').removeClass('optionSelected');
          $(this).addClass('optionSelected');
          let index = $(view).find('div.rangeAnswer').index($(this));
          question.responseIndexes = [index];
        })
    );

    $($(view).find('div.rangeAnswer')[question.getResponse() - 1]).addClass('optionSelected');

    $(view).appendTo($(container));
  }

  drawViewResponse(container) {
    super.drawViewResponse();
    let question = this;
    let parent_template = question.parent_template;
    let view = $(this.view_question_DOM);

    $(
      $(view)
        .find('div.rangeAnswer')
        .click(function () {
          $(view).find('div.rangeAnswer').removeClass('optionSelected');
          $(this).addClass('optionSelected');
          let index = $(view).find('div.rangeAnswer').index($(this));
          question.responseIndexes = [index];
        })
    );

    $($(view).find('div.rangeAnswer')[question.getResponse() - 1]).addClass('optionSelected');

    if (question.hasOwnProperty('assetUuids')) {
      if (question.assetUuids.length) {
        let uuid = question.assetUuids[0];
        let asset = Assets.getAsset(uuid);

        // todo write parameters function to provide host and protocol
        let url =
          Parameters.deployment === 'live'
            ? 'https://rapid.apl.uw.edu' + asset.file_url
            : 'https://rapid2.apl.uw.edu' + asset.file_url;

        DOM.new({
          tag: 'img',
          class: 'embeddedAssetViewImg',
          src: url,
          parent: container,
          children: [
            {
              tag: 'button',
              class: 'view-embedded-asset-icon',
              label: SVG.getEyeIcon(),
              style: ['buttonEditItems', 'margin10'],
              up_action: function () {
                parent_template.getEmbeddedAssetViewer(question.id, uuid, 'map-container');
              },
            },
          ],
          click: function () {
            // check for map view embedded asset element
            if ($('#map-info-panel .embeddedAssetViewImg').length) {
              parent_template.getEmbeddedAssetViewer(question.id, uuid, 'map-container');
            }
          },
        });
      }
    }

    if (!question.is_sub_question) {
      $(view).appendTo($(container));
    } else {
      // remove sub questions because we will re-add them with completed answers
      let option_element = $(container).find('tr.questionOption')[question.answer_index];
      if ($(option_element).next().hasClass('subQuestion')) $(option_element).next().remove();
      $(view).insertAfter($(option_element));
    }
  }
}
class Matrix extends Question {
  constructor(metadata, parent_template, question_num, template_question_num, section, is_new) {
    super(metadata, parent_template, question_num, template_question_num, section, is_new);

    // default matrix question is 2x2
    // matrix questions cannot contain sub questions and they cannot be sub-questions

    this.scroll_icon_src = 'lib/images/icons/icon-matrix-46x46.png';
    this.scroll_icon_error_src = 'lib/images/icons/icon-matrix-error-46x46.png';
    $(this.scroll_icon).find('img').attr('src', this.scroll_icon_src);
    $(this.reorder_list_item).find('img').attr('src', this.scroll_icon_src);

    let matrix_question = this;

    let instruction_class = 'instructionText';
    if (!this.instructions) instruction_class += ' hidden';

    if (!this.mode) this.mode = 'single';

    matrix_question.view_question_DOM = null;
    matrix_question.edit_question_DOM = null;

    //table for view mode display
    let table_rows = [];
    let table_columns_headers = [{ tag: 'td', class: 'spacer', html: 'spacer' }];

    //input fields for edit mode
    let edit_row_fields = [{ tag: 'p', class: 'editFieldLabel', html: 'Rows (Questions)' }];
    let edit_column_fields = [{ tag: 'p', class: 'editFieldLabel', html: 'Columns (Options)' }];

    let option_class = 'matrixOption';
    let container_class = '.wrapper';

    let edit_row_options = [];
    let edit_column_options = [];

    table_rows.push({ tag: 'tr', class: 'viewModeColumns', children: table_columns_headers });

    //rows
    for (let j = 0; j < this.rows.length; j++) {
      let row_values = [
        { tag: 'td', class: 'matrixRow', children: [{ tag: 'p', class: 'questionMatrixRowLabel', html: this.rows[j].label }] },
      ];

      for (let i = 0; i < this.columns.length; i++)
        row_values.push({ tag: 'td', children: [{ tag: 'div', class: 'matrixOptionBubble' }] });

      table_rows.push({ tag: 'tr', children: row_values });

      edit_row_options.push({
        tag: 'div',
        class: 'wrapper alignLeft matrixOption',
        children: [
          {
            tag: 'button',
            style: ['buttonMoveQuestionnaireOption'],
            label: SVG.getMoveQuestionnaireItemsIcon(),
            mousedown: function () {
              // highlight draggable element
              $(this).parent().addClass('originalQuestionPlaceholder');
              let question_container_height = $(matrix_question.edit_question_DOM).height();
              $(matrix_question.edit_question_DOM).height(question_container_height);

              // store selected row offset
              let offset = $(this).offset().top;

              // hide all sub questions to make dragging easier
              $(matrix_question.edit_question_DOM).find('.subQuestion').hide();

              // set height of all draggable rows
              $.each($(matrix_question.edit_question_DOM).find('.' + option_class), function (index, value) {
                let height = $(value).height();
                $(value).height(height);
              });

              let top_offset_diff = offset - $(this).offset().top;

              if (top_offset_diff !== 0)
                $(
                  $('#questionnaire-view-template').scrollTop(
                    $('#questionnaire-view-template').scrollTop() - top_offset_diff
                  )
                );
            },
            mouseup: function () {
              $(this).parent().parent().removeClass('originalQuestionPlaceholder');
              $(matrix_question.edit_question_DOM)
                .find('.' + option_class)
                .height('auto');
              $(matrix_question.edit_question_DOM).find(container_class).height('auto');
              $('#questionnaire-view-template').height('auto');
              $(matrix_question.edit_question_DOM).height('auto');
              $(matrix_question.edit_question_DOM).find('.subQuestion').show();
              $(matrix_question.edit_question_DOM)
                .find('.question-edit-field-container, .sub-question-edit-field-container')
                .height('auto');
            },
          },

          {
            tag: 'div',
            class: 'MultipleChoiceAnswerField',
            children: [
              {
                tag: 'button',
                style: ['MultipleChoiceBubble', 'removableAnswer'],
                up_action: function () {
                  matrix_question.removeRow(this, j);
                },
                label: SVG.getBlackCloseOutIcon(),
              },
              {
                tag: 'input',
                class: 'MultipleChoiceInput',
                value: this.rows[j].label,
                blur: function () {
                  matrix_question.rows[j].label = $(this).val().trim();
                  matrix_question.rows[j].value = Utils.formatVariableName($(this).val().trim());
                  $(this).parent().parent().find('.answerVariableName').val(matrix_question.rows[j].value);

                  $($(matrix_question.view_question_DOM).find('tr').not('.viewModeColumns').find('p')[j]).html(
                    $(this).val().trim()
                  );
                  // matrix_question.updateEmptyFields()
                  matrix_question.inspectErrors();
                },
                keyup: function () {
                  if (parent_template.update_timer !== null) clearTimeout(parent_template.update_timer);
                  let input = $(this);
                  parent_template.update_timer = setTimeout(function () {
                    matrix_question.rows[j].label = $(input).val().trim();
                    matrix_question.rows[j].value = Utils.formatVariableName($(input).val().trim());
                    $(input).parent().parent().find('.answerVariableName').val(matrix_question.rows[j].value);

                    if ($(input).val()) {
                      $($(matrix_question.view_question_DOM).find('tr').not('.viewModeColumns').find('p')[j]).html(
                        $(input).val().trim()
                      );
                    } else {
                      $($(matrix_question.view_question_DOM).find('tr').not('.viewModeColumns').find('p')[j]).html(
                        Questionnaires.NO_ANSWER_TEXT
                      );
                    }
                    // matrix_question.updateEmptyFields();
                    matrix_question.inspectErrors();
                  }, 450);
                },
              },
            ],
          },
          {
            tag: 'div',
            class: 'variableOptionWrapper',
            children: [
              {
                tag: 'input',
                class: 'MultipleChoiceInput answerVariableName',
                value: Utils.formatVariableName(matrix_question.rows[j].value),
                blur: function () {
                  matrix_question.rows[j].value = $(this).val().trim();
                  parent_template.save();
                },
                keyup: function () {
                  let input = $(this);
                  if (parent_template.update_timer) clearTimeout(parent_template.update_timer);
                  let value = $(input).val().trim();
                  clearTimeout(parent_template.update_timer);
                  parent_template.update_timer = setTimeout(function () {
                    matrix_question.rows[j].value = Utils.formatVariableName(value);
                    $(input).val(matrix_question.rows[j].value);
                    matrix_question.inspectErrors();
                  }, 1000);
                },
              },
            ],
          },
        ],
      });
    }

    edit_row_fields.push({ tag: 'div', class: 'edit-row-fields-wrapper', children: edit_row_options });

    edit_row_fields.push({
      tag: 'div',
      class: 'wrapper alignLeft newRowWrapper',
      children: [
        {
          tag: 'div',
          class: 'addItemRow',
          click: function () {
            matrix_question.addRow();
          },
          children: [
            { tag: 'button', label: SVG.getBlackPlusSign(), style: ['buttonAddAnswer'] },
            { tag: 'p', class: 'answerLabel', html: 'Add Row' },
          ],
        },
      ],
    });

    //columns
    for (let j = 0; j < this.columns.length; j++) {
      table_columns_headers.push({
        tag: 'td',
        children: [{ tag: 'p', class: 'questionMatrixColumnLabel', html: this.columns[j].label }],
      });

      edit_column_options.push({
        tag: 'div',
        class: 'wrapper alignLeft matrixOption',
        children: [
          {
            tag: 'button',
            style: ['buttonMoveQuestionnaireOption'],
            label: SVG.getMoveQuestionnaireItemsIcon(),
            mousedown: function () {
              // highlight draggable element
              $(this).parent().addClass('originalQuestionPlaceholder');

              // set parent container height before collapsing
              let question_container_height = $(matrix_question.edit_question_DOM).height();
              $(matrix_question.edit_question_DOM).height(question_container_height);

              // store selected row offset
              let offset = $(this).offset().top;

              // hide all sub questions to make dragging easier
              $(matrix_question.edit_question_DOM).find('.subQuestion').hide();

              // set height of all draggable rows
              $.each($(matrix_question.edit_question_DOM).find('.' + option_class), function (index, value) {
                let height = $(value).height();
                $(value).height(height);
              });

              let top_offset_diff = offset - $(this).offset().top;
              if (top_offset_diff !== 0)
                $(
                  $('#questionnaire-view-template').scrollTop(
                    $('#questionnaire-view-template').scrollTop() - top_offset_diff
                  )
                );
            },
            mouseup: function () {
              $(this).parent().parent().removeClass('originalQuestionPlaceholder');
              $(matrix_question.edit_question_DOM)
                .find('.' + option_class)
                .height('auto');
              $(matrix_question.edit_question_DOM).find(container_class).height('auto');
              $('#questionnaire-view-template').height('auto');
              $(matrix_question.edit_question_DOM).height('auto');
              $(matrix_question.edit_question_DOM).find('.subQuestion').show();
              $(matrix_question.edit_question_DOM)
                .find('.question-edit-field-container, .sub-question-edit-field-container')
                .height('auto');
            },
          },

          {
            tag: 'div',
            class: 'MultipleChoiceAnswerField',
            children: [
              {
                tag: 'button',
                style: ['MultipleChoiceBubble', 'removableAnswer'],
                up_action: function () {
                  matrix_question.removeColumn(this, j);
                },
                label: SVG.getBlackCloseOutIcon(),
              },
              {
                tag: 'input',
                class: 'MultipleChoiceInput',
                value: this.columns[j].label,
                blur: function () {
                  matrix_question.columns[j].label = $(this).val().trim();
                  matrix_question.columns[j].value = Utils.formatVariableName($(this).val().trim());
                  $(this).parent().parent().find('.answerVariableName').val(matrix_question.columns[j].value);

                  $($(matrix_question.view_question_DOM).find('tr.viewModeColumns p')[j]).html($(this).val().trim());
                  matrix_question.inspectErrors();
                  // matrix_question.updateEmptyFields()
                },
                keyup: function () {
                  if (parent_template.update_timer !== null) clearTimeout(parent_template.update_timer);
                  let input = $(this);

                  parent_template.update_timer = setTimeout(function () {
                    matrix_question.columns[j].label = $(input).val().trim();
                    matrix_question.columns[j].value = Utils.formatVariableName($(input).val().trim());
                    $(input).parent().parent().find('.answerVariableName').val(matrix_question.columns[j].value);

                    if ($(input).val()) {
                      $($(matrix_question.view_question_DOM).find('tr.viewModeColumns p')[j]).html(
                        $(input).val().trim()
                      );

                      // console.log( $($(matrix_question.view_question_DOM).find("tr.viewModeColumns").find("p")[j + 1]))
                      // $($(matrix_question.view_question_DOM).find("tr").not(".viewModeColumns").find("p")[j]).html($(input).val().trim());
                    } else {
                      $($(matrix_question.view_question_DOM).find('tr.viewModeColumns p')[j]).html(
                        Questionnaires.NO_ANSWER_TEXT
                      );

                      // $($(matrix_question.view_question_DOM).find("tr").not(".viewModeColumns").find("p")[j]).html(Questionnaires2.NO_ANSWER_TEXT);
                    }
                    matrix_question.inspectErrors();

                    // matrix_question.();
                  }, 450);
                },
              },
            ],
          },
          {
            tag: 'div',
            class: 'variableOptionWrapper',
            children: [
              {
                tag: 'input',
                class: 'MultipleChoiceInput answerVariableName',
                value: Utils.formatVariableName(matrix_question.columns[j].value),
                blur: function () {
                  matrix_question.columns[j].value = Utils.formatVariableName($(this).val().trim());
                  parent_template.save();
                },
                keyup: function () {
                  let input = $(this);
                  if (parent_template.update_timer) clearTimeout(parent_template.update_timer);
                  let value = $(input).val().trim();
                  clearTimeout(parent_template.update_timer);
                  parent_template.update_timer = setTimeout(function () {
                    matrix_question.columns[j].value = Utils.formatVariableName(value);
                    $(input).val(matrix_question.columns[j].value);
                    matrix_question.inspectErrors();
                  }, 1000);
                },
              },
            ],
          },
        ],
      });
    }

    edit_column_fields.push({ tag: 'div', class: 'edit-column-fields-wrapper', children: edit_column_options });

    edit_column_fields.push({
      tag: 'div',
      class: 'wrapper alignLeft newColumnWrapper',
      children: [
        {
          tag: 'div',
          class: 'addItemRow',
          click: function () {
            matrix_question.addColumn();
          },
          children: [
            { tag: 'button', label: SVG.getBlackPlusSign(), style: ['buttonAddAnswer'] },
            { tag: 'p', class: 'answerLabel', html: 'Add Column' },
          ],
        },
      ],
    });

    this.view_question_DOM = DOM.new({
      tag: 'div',
      class: 'questionWrapper',
      children: [
        { tag: 'p', class: 'questionNumber', html: 'Q' + this.template_question_num },
        {
          tag: 'div',
          class: 'optionsWrapper',
          children: [{ tag: 'p', class: 'editFieldLabel inline boldText redText', html: 'Required' }],
        },
        { tag: 'p', class: 'questionType', html: this.type },
        { tag: 'p', class: 'headingText', html: this.heading },
        { tag: 'p', class: 'questionText', html: this.label },
        { tag: 'p', class: instruction_class, html: this.instructions },
        { tag: 'div', class: 'wrapper', children: [{ tag: 'table', class: 'matrixQuestionTable', children: table_rows }] },
        {
          tag: 'div',
          class: 'wrapper',
          children: [{ tag: 'div', class: 'buttonDecline disabled hidden positionLeft', html: 'Prefer not to answer' }],
        },
      ],
    });

    if (!this.heading) $(this.view_question_DOM).find('p.headingText').addClass('hidden');

    this.edit_question_DOM = DOM.new({
      tag: 'div',
      class: 'questionWrapper',
      children: [
        { tag: 'p', class: 'questionNumber', html: 'Q' + template_question_num },
        this.getRequiredSelector(),
        { tag: 'p', class: 'questionType hidden', html: this.type },
        {
          tag: 'div',
          class: 'modeSelector',
          children: [
            {
              tag: 'div',
              class: 'modeOption',
              html: 'Matrix Single Select',
              click: function () {
                matrix_question.setMode('single');
              },
            },
            {
              tag: 'div',
              class: 'modeOption',
              html: 'Matrix Multi Select',
              click: function () {
                matrix_question.setMode('multi');
              },
            },
          ],
        },
        matrix_question.getHeadingField(),
        matrix_question.getQuestionField(),
        matrix_question.getInstructionField(),

        { tag: 'div', class: 'wrapper', children: edit_row_fields },
        { tag: 'div', class: 'wrapper', children: edit_column_fields },
        matrix_question.getDeclineField(),

        {
          tag: 'div',
          class: 'wrapperExtraTopPad',
          children: [
            {
              tag: 'button',
              class: 'buttonDeleteQuestion',
              label: 'Delete Question',
              up_action: function () {
                matrix_question.getDeleteQuestionForm();
              },
            },
          ],
        },
      ],
    });

    if (is_new) {
      //add new question to template
      if (!parent_template.edit_mode) parent_template.toggleView();
      let new_question = parent_template.edit_mode ? $(this.edit_question_DOM) : $(this.view_question_DOM);
      $('#questionnaire-view-template').children().not('.newQuestionModalForm').remove();
      $(new_question).appendTo($('#questionnaire-view-template'));
      $('.questionScrollIcon, .headerScrollIcon, .sectionScrollIcon, .sectionScrollContainer').removeClass('iconActive');
      $(this.scroll_icon).addClass('iconActive');
      parent_template.updateItemCount();
    }

    $(this.branching_icon).find('img').attr('src', this.scroll_icon_src);
    $(this.edit_question_DOM).find('.questionValueField').remove();
    if (this.decline) this.addDeclineOption(this.decline);
    this.setMode(this.mode);
    this.inspectErrors();

    // this.updateEmptyFields();
    this.makeEditable();
  }

  setEditableAll() {
    this.makeEditable();
  }

  updateOptions() {
    // update matrix options order and save

    // todo save rows and columns arrays

    let matrix_question = this;
    let rows = $(matrix_question.edit_question_DOM).find('.edit-row-fields-wrapper .matrixOption');
    let columns = $(matrix_question.edit_question_DOM).find('.edit-column-fields-wrapper .matrixOption');
    let new_rows = [];
    let new_columns = [];

    $.each(rows, function (index, value) {
      let response = $(value).find('.MultipleChoiceInput').val();
      let response_value = $(value).find('.answerVariableName').val();

      // todo should use uuid of some kind here
      // using response and value as a double check should be enough to ensure uniqueness, but not perfect
      for (let option of matrix_question.rows) {
        if (option.value === response_value) {
          if (option.label === response) {
            if (!new_rows.includes(option)) new_rows.push(option);
          }
        }
      }
    });

    $.each(columns, function (index, value) {
      let response = $(value).find('.MultipleChoiceInput').val();
      let response_value = $(value).find('.answerVariableName').val();

      // using response and value as a double check should be enough to ensure uniqueness, but not perfect

      for (let option of matrix_question.columns) {
        if (option.value === response_value) {
          if (option.label === response) {
            if (!new_columns.includes(option)) new_columns.push(option);
          }
        }
      }
    });

    matrix_question.rows = new_rows;
    matrix_question.columns = new_columns;
    matrix_question.parent_template.save();
  }

  makeEditable() {
    // matrix questions CANNOT contain sub questions or BE subquestions,
    // which makes reordering the options easier than a single select question type

    // TODO NEED TO HAVE SORTABLE BEHAVIOUR APPLIED SEPERATELY TO PREVENT CONFLICTS !!!!!!!!!

    let matrix_question = this;
    let row_container = $(matrix_question.edit_question_DOM).find('.edit-row-fields-wrapper');
    let column_container = $(matrix_question.edit_question_DOM).find('.edit-column-fields-wrapper');

    $(row_container).sortable({
      axis: 'y',
      forcePlaceholderSize: true,
      handle: '.buttonMoveQuestionnaireOption',
      placeholder: 'reorder-option-placeholder',
      containment: row_container,
      tolerance: 'pointer',
      start: function () {
        $(row_container).sortable('refreshPositions');
      },

      helper: function (e, li) {
        this.copyHelper = li.clone().insertAfter(li);
        $(this).data('copied', false);
        let clone = li.clone().addClass('reorderItemClone');
        $(clone).find('.subQuestion, .optionValueWrapper').remove();
        return clone;
      },
      cancel: function () {
        $(matrix_question.edit_question_DOM).find('.originalQuestionPlaceholder').removeClass('originalQuestionPlaceholder');
      },
      stop: function () {
        $(matrix_question.edit_question_DOM).find('.originalQuestionPlaceholder').removeClass('originalQuestionPlaceholder');

        setTimeout(function () {
          matrix_question.updateOptions();
        }, 100);

        let copied = $(this).data('copied');
        if (!copied) this.copyHelper.remove();
        this.copyHelper = null;
      },
    });

    $(column_container).sortable({
      axis: 'y',
      forcePlaceholderSize: true,
      handle: '.buttonMoveQuestionnaireOption',
      placeholder: 'reorder-option-placeholder',
      containment: column_container,
      tolerance: 'pointer',
      start: function () {
        $(column_container).sortable('refreshPositions');
      },

      helper: function (e, li) {
        this.copyHelper = li.clone().insertAfter(li);
        $(this).data('copied', false);
        let clone = li.clone().addClass('reorderItemClone');
        $(clone).find('.subQuestion, .optionValueWrapper').remove();
        return clone;
      },
      cancel: function () {
        $(matrix_question.edit_question_DOM).find('.originalQuestionPlaceholder').removeClass('originalQuestionPlaceholder');
      },
      stop: function () {
        $(matrix_question.edit_question_DOM).find('.originalQuestionPlaceholder').removeClass('originalQuestionPlaceholder');
        setTimeout(function () {
          matrix_question.updateOptions();
        }, 100);

        let copied = $(this).data('copied');
        if (!copied) this.copyHelper.remove();
        this.copyHelper = null;
      },
    });
  }

  removeColumn(column_field, column_index) {
    $(column_field).parent().parent().remove();
    this.columns.splice(column_index, 1);
    $.each($(this.view_question_DOM).find('tr'), function (index, value) {
      $($(value).children('td')[column_index + 1]).remove();
    });
    this.parent_template.save();
  }

  removeRow(row_field, row_index) {
    $(row_field).parent().parent().remove();
    this.rows.splice(row_index, 1);
    let rows = $(this.view_question_DOM).find('tr');
    $(rows[row_index + 1]).remove();
    this.parent_template.save();
  }

  getDeclineField() {
    let question = this;
    let parent_template = this.parent_template;

    return {
      tag: 'div',
      class: 'wrapper noSidePad alignLeft',
      children: [
        {
          tag: 'div',
          class: 'declineOptionWrapper',
          children: [
            { tag: 'button', label: SVG.getBlackPlusSign(), style: ['buttonAddAnswer'] },
            { tag: 'p', class: 'answerLabel', html: 'Add Decline Option' },
            { tag: 'p', class: 'declineLabel hidden', html: 'Decline Option' },
            {
              tag: 'input',
              class: 'declineButtonInput hidden',
              value: 'Prefer not to answer',
              click: function (e) {
                e.stopPropagation();
              },
              blur: function () {
                question.decline.label = $(this).val().trim();
                question.metadata.decline.label = question.decline.label;
                $(question.view_question_DOM).find('td.buttonDecline').children('p').html(question.decline.label);
                $(question.view_question_DOM)
                  .find('.declineColumn p.questionMatrixColumnLabel')
                  .html(question.decline.label);

                // console.log(   $(question.view_question_DOM).find(".declineColumn p.questionMatrixColumnLabel"))
                parent_template.save();
              },

              keyup: function () {
                if (parent_template.update_timer !== null) clearTimeout(parent_template.update_timer);
                let input = $(this);
                parent_template.update_timer = setTimeout(function () {
                  question.decline.label = $(input).val().trim();
                  question.metadata.decline.label = question.decline.label;
                  $(question.view_question_DOM).find('td.buttonDecline').children('p').html(question.decline.label);

                  $(question.view_question_DOM)
                    .find('.declineColumn p.questionMatrixColumnLabel')
                    .html(question.decline.label);

                  parent_template.save();
                }, 450);
              },
            },
          ],
          click: function () {
            if (question.decline) {
              question.decline = null;
              question.metadata.decline = null;

              $($(question.edit_question_DOM).find('.declineButtonInput')[0]).addClass('hidden');
              $($(question.edit_question_DOM).find('.declineOptionWrapper')[0]).children('p.declineLabel').addClass('hidden');
              $($(question.edit_question_DOM).find('.declineOptionWrapper')[0])
                .children('.buttonAddAnswer')
                .html(SVG.getBlackPlusSign());
              $($(question.edit_question_DOM).find('.declineOptionWrapper')[0])
                .children('p.answerLabel')
                .html('Add Decline Option');
              $($(question.edit_question_DOM).find('.declineOptionWrapper')[0])
                .children('p.answerLabel')
                .removeClass('hidden');
              $($(question.edit_question_DOM).find('.declineOptionWrapper')[0]).removeClass('unclickable');

              $($(question.view_question_DOM).find('.declineColumn')).remove();

              //decline with always be last option
              question.parent_template.save();
            } else {
              question.addDeclineOption();
            }
          },
        },
      ],
    };
  }

  addColumn() {
    let matrix_question = this;
    let parent_template = this.parent_template;
    let value = 'Column ' + (matrix_question.columns.length + 1);
    let index = matrix_question.columns.length;

    let option_class = 'matrixOption';
    let container_class = '.wrapper';

    let new_column = DOM.new({
      tag: 'div',
      class: 'wrapper alignLeft matrixOption',
      children: [
        {
          tag: 'button',
          style: ['buttonMoveQuestionnaireOption'],
          label: SVG.getMoveQuestionnaireItemsIcon(),
          mousedown: function () {
            // highlight draggable element
            $(this).parent().addClass('originalQuestionPlaceholder');
            let question_container_height = $(matrix_question.edit_question_DOM).height();
            $(matrix_question.edit_question_DOM).height(question_container_height);

            // store selected row offset
            let offset = $(this).offset().top;

            // hide all sub questions to make dragging easier
            $(matrix_question.edit_question_DOM).find('.subQuestion').hide();

            // set height of all draggable rows
            $.each($(matrix_question.edit_question_DOM).find('.' + option_class), function (index, value) {
              let height = $(value).height();
              $(value).height(height);
            });

            let top_offset_diff = offset - $(this).offset().top;

            if (top_offset_diff !== 0)
              $($('#questionnaire-view-template').scrollTop($('#questionnaire-view-template').scrollTop() - top_offset_diff));
          },
          mouseup: function () {
            $(this).parent().parent().removeClass('originalQuestionPlaceholder');
            $(matrix_question.edit_question_DOM)
              .find('.' + option_class)
              .height('auto');
            $(matrix_question.edit_question_DOM).find(container_class).height('auto');
            $('#questionnaire-view-template').height('auto');
            $(matrix_question.edit_question_DOM).height('auto');
            $(matrix_question.edit_question_DOM).find('.subQuestion').show();
            $(matrix_question.edit_question_DOM)
              .find('.question-edit-field-container, .sub-question-edit-field-container')
              .height('auto');
          },
        },

        {
          tag: 'div',
          class: 'MultipleChoiceAnswerField',
          children: [
            {
              tag: 'button',
              style: ['MultipleChoiceBubble', 'removableAnswer'],
              up_action: function () {
                matrix_question.removeColumn(this, index);
              },
              label: SVG.getBlackCloseOutIcon(),
            },
            {
              tag: 'input',
              class: 'MultipleChoiceInput',
              value: value,
              blur: function () {
                let input = $(this);

                matrix_question.columns[index].label = $(this).val().trim();
                matrix_question.columns[index].value = Utils.formatVariableName($(this).val().trim());
                $(this).parent().parent().find('.answerVariableName').val(matrix_question.columns[index].value);
                // $($(matrix_question.view_question_DOM).find("tr").not(".viewModeColumns").find("p")[index]).html($(this).val().trim());

                if ($(input).val()) {
                  $($(matrix_question.view_question_DOM).find('tr.viewModeColumns p')[index + 1]).html(
                    $(input).val().trim()
                  );

                  // console.log( $($(matrix_question.view_question_DOM).find("tr.viewModeColumns").find("p")[j + 1]))

                  //
                  // $($(matrix_question.view_question_DOM).find("tr").not(".viewModeColumns").find("p")[j]).html($(input).val().trim());
                } else {
                  $($(matrix_question.view_question_DOM).find('tr.viewModeColumns p')[index + 1]).html(
                    Questionnaires.NO_ANSWER_TEXT
                  );

                  // $($(matrix_question.view_question_DOM).find("tr").not(".viewModeColumns").find("p")[j]).html(Questionnaires2.NO_ANSWER_TEXT);
                }
                matrix_question.inspectErrors();
              },
              keyup: function () {
                if (parent_template.update_timer !== null) clearTimeout(parent_template.update_timer);
                let input = $(this);
                parent_template.update_timer = setTimeout(function () {
                  matrix_question.columns[index].label = $(input).val().trim();
                  matrix_question.columns[index].value = Utils.formatVariableName($(input).val().trim());
                  $(input).parent().parent().find('.answerVariableName').val(matrix_question.columns[index].value);

                  if ($(input).val()) {
                    $($(matrix_question.view_question_DOM).find('tr.viewModeColumns p')[index]).html(
                      $(input).val().trim()
                    );
                  } else {
                    $($(matrix_question.view_question_DOM).find('tr.viewModeColumns p')[index]).html(
                      Questionnaires.NO_ANSWER_TEXT
                    );
                  }
                  // matrix_question.updateEmptyFields();
                  matrix_question.inspectErrors();
                }, 450);
              },
            },
          ],
        },
        {
          tag: 'div',
          class: 'variableOptionWrapper',
          children: [
            {
              tag: 'input',
              class: 'MultipleChoiceInput answerVariableName',
              value: Utils.formatVariableName(value),
              blur: function () {
                matrix_question.columns[index].value = $(this).val().trim();
                parent_template.save();
              },
              keyup: function () {
                let input = $(this);
                if (parent_template.update_timer) clearTimeout(parent_template.update_timer);
                let value = $(input).val().trim();
                clearTimeout(parent_template.update_timer);
                parent_template.update_timer = setTimeout(function () {
                  matrix_question.columns[index].value = Utils.formatVariableName(value);
                  $(input).val(matrix_question.columns[index].value);
                  matrix_question.inspectErrors();
                }, 1000);
              },
            },
          ],
        },
      ],
    });

    let view_mode_column = DOM.new({ tag: 'td', children: [{ tag: 'p', class: 'questionMatrixColumnLabel', html: value }] });

    //update json, UI
    matrix_question.columns.push({ value: Utils.formatVariableName(value), label: value });
    $(new_column).appendTo($('.edit-column-fields-wrapper'));
    $(new_column).insertBefore($('.newColumnWrapper'));

    if (matrix_question.decline) {
      $(view_mode_column).insertBefore($(matrix_question.view_question_DOM).find('.viewModeColumns .declineColumn'));
    } else {
      $(view_mode_column).appendTo($(matrix_question.view_question_DOM).find('.viewModeColumns'));
    }

    $.each($(matrix_question.view_question_DOM).find('tr').not('.viewModeColumns'), function (index, value) {
      let item = DOM.new({ tag: 'td', children: [{ tag: 'div', class: 'matrixOptionBubble' }] });
      $(item).appendTo($(value));
    });

    matrix_question.setMode(this.mode);
    matrix_question.makeEditable();

    parent_template.save();
  }

  addRow() {
    let matrix_question = this;
    let parent_template = this.parent_template;

    let value = 'Row ' + (matrix_question.rows.length + 1);
    let index = matrix_question.rows.length;

    let option_class = 'matrixOption';
    let container_class = '.wrapper';

    let new_row = DOM.new({
      tag: 'div',
      class: 'wrapper alignLeft matrixOption',
      children: [
        {
          tag: 'button',
          style: ['buttonMoveQuestionnaireOption'],
          label: SVG.getMoveQuestionnaireItemsIcon(),
          mousedown: function () {
            // highlight draggable element
            $(this).parent().addClass('originalQuestionPlaceholder');
            let question_container_height = $(matrix_question.edit_question_DOM).height();
            $(matrix_question.edit_question_DOM).height(question_container_height);

            // store selected row offset
            let offset = $(this).offset().top;

            // hide all sub questions to make dragging easier
            $(matrix_question.edit_question_DOM).find('.subQuestion').hide();

            // set height of all draggable rows
            $.each($(matrix_question.edit_question_DOM).find('.' + option_class), function (index, value) {
              let height = $(value).height();
              $(value).height(height);
            });

            let top_offset_diff = offset - $(this).offset().top;

            if (top_offset_diff !== 0)
              $($('#questionnaire-view-template').scrollTop($('#questionnaire-view-template').scrollTop() - top_offset_diff));
          },
          mouseup: function () {
            $(this).parent().parent().removeClass('originalQuestionPlaceholder');
            $(matrix_question.edit_question_DOM)
              .find('.' + option_class)
              .height('auto');
            $(matrix_question.edit_question_DOM).find(container_class).height('auto');
            $('#questionnaire-view-template').height('auto');
            $(matrix_question.edit_question_DOM).height('auto');
            $(matrix_question.edit_question_DOM).find('.subQuestion').show();
            $(matrix_question.edit_question_DOM)
              .find('.question-edit-field-container, .sub-question-edit-field-container')
              .height('auto');
          },
        },

        {
          tag: 'div',
          class: 'MultipleChoiceAnswerField',
          children: [
            {
              tag: 'button',
              style: ['MultipleChoiceBubble', 'removableAnswer'],
              up_action: function () {
                matrix_question.removeRow(this, index);
              },
              label: SVG.getBlackCloseOutIcon(),
            },
            {
              tag: 'input',
              class: 'MultipleChoiceInput',
              value: value,
              blur: function () {
                matrix_question.rows[index].label = $(this).val().trim();
                matrix_question.rows[index].value = Utils.formatVariableName($(this).val().trim());
                $(this).parent().parent().find('.answerVariableName').val(matrix_question.rows[index].value);
                $($(matrix_question.view_question_DOM).find('tr').not('.viewModeColumns').find('p')[index]).html(
                  $(this).val().trim()
                );
                // matrix_question.updateEmptyFields();
                matrix_question.inspectErrors();
              },
              keyup: function () {
                if (parent_template.update_timer !== null) clearTimeout(parent_template.update_timer);
                let input = $(this);
                parent_template.update_timer = setTimeout(function () {
                  matrix_question.rows[index].label = $(input).val().trim();
                  matrix_question.rows[index].value = Utils.formatVariableName($(input).val().trim());
                  $(input).parent().parent().find('.answerVariableName').val(matrix_question.rows[index].value);

                  if ($(input).val()) {
                    $($(matrix_question.view_question_DOM).find('tr').not('.viewModeColumns').find('p')[index]).html(
                      $(input).val().trim()
                    );
                  } else {
                    $($(matrix_question.view_question_DOM).find('tr').not('.viewModeColumns').find('p')[index]).html(
                      Questionnaires.NO_ANSWER_TEXT
                    );
                  }
                  matrix_question.inspectErrors();

                  // matrix_question.updateEmptyFields();
                }, 450);
              },
            },
          ],
        },

        {
          tag: 'div',
          class: 'variableOptionWrapper',
          children: [
            {
              tag: 'input',
              class: 'MultipleChoiceInput answerVariableName',
              value: Utils.formatVariableName(value),
              blur: function () {
                matrix_question.rows[index].value = $(this).val().trim();
                // matrix_question.updateEmptyFields();
              },
              keyup: function () {
                let input = $(this);
                if (parent_template.update_timer) clearTimeout(parent_template.update_timer);
                let value = $(input).val().trim();
                clearTimeout(parent_template.update_timer);
                parent_template.update_timer = setTimeout(function () {
                  matrix_question.rows[index].value = Utils.formatVariableName(value);
                  $(input).val(matrix_question.rows[index].value);
                  matrix_question.inspectErrors();
                }, 1000);
              },
            },
          ],
        },
      ],
    });

    let row_values = [{ tag: 'td', class: 'matrixRow', children: [{ tag: 'p', class: 'questionMatrixRowLabel', html: value }] }];

    for (let i = 0; i < matrix_question.columns.length; i++)
      row_values.push({ tag: 'td', children: [{ tag: 'div', class: 'matrixOptionBubble' }] });

    if (matrix_question.decline) row_values.push({ tag: 'td', children: [{ tag: 'div', class: 'matrixOptionBubble' }] });

    let view_mode_row = DOM.new({ tag: 'tr', children: row_values });

    //update json, UI
    matrix_question.rows.push({ value: Utils.formatVariableName(value), label: value });
    $(new_row).appendTo($('.edit-row-fields-wrapper'));
    $(view_mode_row).appendTo($(matrix_question.view_question_DOM).find('.matrixQuestionTable'));

    matrix_question.setMode(this.mode);
    matrix_question.makeEditable();
    parent_template.save();
  }

  setMode(mode) {
    let edit_mode_class;
    let view_mode_class;
    let option_index;
    this.mode = mode;
    this.metadata.mode = mode;
    switch (mode) {
      case 'single': {
        $(this.view_question_DOM).find('p.questionType').html('Matrix Single Select');
        view_mode_class = 'matrixOptionBubble';
        edit_mode_class = 'MultipleChoiceBubble';
        option_index = 0;
        break;
      }

      case 'multi': {
        $(this.view_question_DOM).find('p.questionType').html('Matrix Multi Select');
        view_mode_class = 'matrixMultiOptionBubble';
        edit_mode_class = 'MultipleSelectionBubble';
        option_index = 1;
        break;
      }
    }

    $(this.edit_question_DOM).find('.MultipleChoiceBubble, .MultipleSelectionBubble').attr('class', edit_mode_class);
    $(this.view_question_DOM).find('.matrixOptionBubble, .matrixMultiOptionBubble').attr('class', view_mode_class);
    $(this.edit_question_DOM).find('.modeSelector').children('.toggled').removeClass('toggled');
    $($(this.edit_question_DOM).find('.modeOption')[option_index]).addClass('toggled');
    if (!this.required || !this.hasOwnProperty('required')) $(this.view_question_DOM).find('.optionsWrapper').hide();
    this.parent_template.save();
  }

  hasEmptyValues() {
    // let matrix = this;
    // let error = false;
    //
    // if (matrix.rows) {
    //     for (let row of matrix.rows) {
    //         if (!row.label) {
    //             $($(matrix.edit_question_DOM).find(".MultipleChoiceInput")[matrix.rows.indexOf(row)]).addClass("questionError");
    //             error = true;
    //         } else {
    //             $($(matrix.edit_question_DOM).find(".MultipleChoiceInput")[matrix.rows.indexOf(row)]).removeClass("questionError");
    //         }
    //     }
    // }
    //
    // // if (error) console.log("Has Empty Values")
    //
    // return error;
  }

  addDeclineOption() {
    let question = this;
    let parent_template = this.parent_template;

    if (!question.decline) {
      question.decline = { label: 'Prefer not to answer' };
    } else {
      if (!question.decline.label) question.decline = { label: 'Prefer not to answer' };
    }

    question.metadata.decline = question.decline;

    $($(question.edit_question_DOM).find('.declineButtonInput')[0]).val(question.decline.label);
    // $($(question.view_question_DOM).find(".buttonDecline")[0]).html(question.decline.label);

    $($(question.edit_question_DOM).find('.declineButtonInput')[0]).removeClass('hidden');
    // $($(question.view_question_DOM).find(".buttonDecline")[0]).removeClass("hidden");

    $($(question.edit_question_DOM).find('.declineOptionWrapper')[0]).children('.buttonAddAnswer').html(SVG.getBlackMinusSign());
    $($(question.edit_question_DOM).find('.declineOptionWrapper')[0]).addClass('unclickable');
    $($(question.edit_question_DOM).find('.declineOptionWrapper')[0]).children('.answerLabel').addClass('hidden');
    $($(question.edit_question_DOM).find('.declineOptionWrapper')[0]).children('p.editFieldLabel').removeClass('hidden');

    let value = question.decline.label;
    let view_mode_column = DOM.new({
      tag: 'td',
      class: 'declineColumn',
      children: [{ tag: 'p', class: 'questionMatrixColumnLabel', html: value }],
    });

    //update json, UI
    $(view_mode_column).appendTo($(question.view_question_DOM).find('.viewModeColumns'));
    $.each($(question.view_question_DOM).find('tr').not('.viewModeColumns'), function (index, value) {
      let item = DOM.new({ tag: 'td', class: 'declineColumn', children: [{ tag: 'div', class: 'matrixOptionBubble' }] });
      $(item).appendTo($(value));
    });

    this.setMode(this.mode);
    question.parent_template.save();
  }

  drawEditableResponse(container) {
    super.drawEditableResponse();

    let matrix = this;
    let view = $(matrix.asset_edit_view);

    let view_mode_rows = $(view).find('tr').not('.viewModeColumns');

    $(view)
      .find('tr .matrixOptionBubble')
      .click(function () {
        let row_index = $(this).parent().parent().index() - 1;
        let col_index = $(this).parent().index() - 1;

        if ($(this).hasClass('optionSelected')) {
          // console.log("removing class")
          $(this).removeClass('optionSelected');

          if (matrix.responseMatrixIndexes[row_index].includes(col_index)) {
            let index = matrix.responseMatrixIndexes[row_index].indexOf(col_index);
            matrix.responseMatrixIndexes[row_index].splice(index, 1);
          }
        } else {
          $(this).addClass('optionSelected');
          if (matrix.responseMatrixIndexes[row_index]) {
            matrix.responseMatrixIndexes[row_index].push(col_index);
          } else {
            matrix.responseMatrixIndexes[row_index] = [col_index];
          }
        }

        // $(view).find("div.rangeAnswer").removeClass("optionSelected")
        // $(this).addClass("optionSelected");
      });

    for (let row in matrix.responseMatrixIndexes) {
      let row_responses = matrix.responseMatrixIndexes[row];
      if (!row_responses.length) continue;

      for (let col of row_responses) {
        let matrix_option_row = $(view_mode_rows).get(row);
        // let matrix_option = $($(matrix_option_row).find(".matrixOptionBubble").get(row_responses[col]))
        let matrix_option = $($(matrix_option_row).find('.matrixOptionBubble').get(col));

        matrix_option.addClass('optionSelected');
      }
    }

    $(view).appendTo(container);
  }

  drawViewResponse(container) {
    super.drawViewResponse(container);

    let question = this;
    let parent_template = this.parent_template;
    let view = $(question.asset_view_view);

    let view_mode_rows = $(view).find('tr').not('.viewModeColumns');

    // $(view).find("tr .matrixOptionBubble").click(function() {
    //
    //     let row_index = $(this).parent().parent().index() - 1;
    //     let col_index = $(this).parent().index() - 1;
    //
    //     if ($(this).hasClass("optionSelected")) {
    //
    //         // console.log("removing class")
    //         $(this).removeClass("optionSelected")
    //
    //         if (question.responseMatrixIndexes[row_index].includes(col_index)) {
    //             let index = question.responseMatrixIndexes[row_index].indexOf(col_index)
    //             question.responseMatrixIndexes[row_index].splice(index, 1);
    //         }
    //
    //     } else {
    //
    //         $(this).addClass("optionSelected")
    //         if (question.responseMatrixIndexes[row_index]) {
    //             question.responseMatrixIndexes[row_index].push(col_index)
    //         } else {
    //             question.responseMatrixIndexes[row_index] = [col_index]
    //         }
    //     }
    //
    //     // $(view).find("div.rangeAnswer").removeClass("optionSelected")
    //     // $(this).addClass("optionSelected");
    //
    // });

    let option_class = question.mode === 'multi' ? '.matrixMultiOptionBubble' : '.matrixOptionBubble';

    for (let row in question.responseMatrixIndexes) {
      let row_responses = question.responseMatrixIndexes[row];
      if (!row_responses.length) continue;

      for (let col of row_responses) {
        let matrix_option_row = $(view_mode_rows).get(row);
        let matrix_option = $($(matrix_option_row).find(option_class).get(col));

        matrix_option.addClass('optionSelected');
      }
    }

    if (question.hasOwnProperty('assetUuids')) {
      if (question.assetUuids) {
        if (question.assetUuids.length) {
          for (let uuid of question.assetUuids) {
            let asset = Assets.getAsset(uuid);

            // todo write parameters function to provide host and protocol
            let url =
              Parameters.deployment === 'live'
                ? 'https://rapid.apl.uw.edu' + asset.file_url
                : 'https://rapid2.apl.uw.edu' + asset.file_url;

            DOM.new({
              tag: 'img',
              class: 'embeddedAssetViewImg',
              src: url,
              parent: container,
              children: [
                {
                  tag: 'button',
                  class: 'view-embedded-asset-icon',
                  label: SVG.getEyeIcon(),
                  style: ['buttonEditItems', 'margin10'],
                  up_action: function () {
                    parent_template.getEmbeddedAssetViewer(question.id, uuid, 'map-container');
                  },
                },
              ],
              click: function () {
                // check for map view embedded asset element
                if ($('#map-info-panel .embeddedAssetViewImg').length) {
                  parent_template.getEmbeddedAssetViewer(question.id, uuid, 'map-container');
                }
              },
            });
          }
        }
      }
    }

    $(view).appendTo(container);
  }

  getResponse() {
    //returns array of responses

    let matrix = this;
    let responses = [];
    if (this.responseMatrixIndexes) {
      if (this.responseMatrixIndexes != null) {
        for (let row of matrix.responseMatrixIndexes) {
          let arr = [];

          for (let index of row) {
            if (matrix.columns[index]) {
              arr.push(this.columns[index].label);
            } else if (index === matrix.columns.length) {
              //decline column selected
              arr.push(this.decline.label);
            }
          }
          responses.push(arr);
        }
      }
    }

    // console.log(responses)
    return responses.length ? responses : '';
  }

  getAssetViewerTableCell() {
    let question = this;
    let questionnaire = question.parent_template;

    // draw empty cells for every row if there are no responses
    if (!question.responseMatrixIndexes) {
      for (let row of question.rows) {
        questionnaire.table_cells.push({
          tag: 'td',
          class: 'multi-text-cell',
          children: [
            {
              tag: 'button',
              label: SVG.getPencilSmall(),
              style: ['buttonEditItems', 'button-edit-question'],
              up_action: function () {
                questionnaire.editCompletedQuestionnaire(question.id);
              },
            },
            { tag: 'div', children: [{ tag: 'p', html: '' }] },
          ],
        });
      }
      return;
    }

    function embedded_asset_element(uuid) {
      let asset = Assets.getAsset(uuid);

      let asset_label = asset.title != null ? asset.title : asset.type.toUpperCase();

      let filename = asset_label + '.' + asset.format.toLowerCase();

      return {
        tag: 'div',
        class: 'embeddedAssetRow',
        children: [
          { tag: 'img', class: 'embeddedAsset', src: asset.file_url },
          { tag: 'p', class: 'embeddedAssetCellLabel', html: "View '<b>" + filename + '</b>' },
        ],
        click: function () {
          questionnaire.getEmbeddedAssetViewer(question.id, uuid, 'questionnaire-viewer-container');
        },
        mouseover: function (e) {
          e.stopPropagation();
          e.stopImmediatePropagation();
          clearTimeout(questionnaire.questionnaire_asset_viewer.tooltip_timer);
          $(questionnaire.questionnaire_asset_viewer.tooltip).hide();
          $(this).parent().removeClass('tooltip-visible');
        },
        mouseleave: function () {
          $(this).removeClass('embedded-asset-selected');
        },
      };
    }

    function generate_question_cell(response, allow_embedded_assets) {
      let cell_children = [
        {
          tag: 'button',
          label: SVG.getPencilSmall(),
          style: ['buttonEditItems', 'button-edit-question'],
          up_action: function () {
            questionnaire.editCompletedQuestionnaire(question.id);
          },
        },
        { tag: 'div', children: [{ tag: 'p', html: response }] },
      ];

      // no embedded assets for sub questions at this time
      if (allow_embedded_assets) {
        if (question.hasOwnProperty('assetUuids')) {
          if (question.assetUuids.length) {
            for (let uuid of question.assetUuids) cell_children.push(embedded_asset_element(uuid));
          }
        }
      }
      return { tag: 'td', class: 'multi-text-cell', children: cell_children };
    }

    for (let row of question.rows) {
      let index = question.rows.indexOf(row);
      let index_row = question.responseMatrixIndexes[index];

      // every row is a "question" and needs it's own column in the questionnaire viewer
      // therefore we need to draw empty table cells for columns rows that are not filled out

      let string = '';
      if (index_row) {
        for (let index of index_row) {
          string = '';
          if (question.columns[index]) {
            string +=
              Assets.viewerOptions.responses === 'label'
                ? question.columns[index].label + '<br><br>'
                : question.columns[index].value + '<br><br>';
          }
        }
      }

      let cell = generate_question_cell(string, true);
      questionnaire.table_cells.push(cell);
    }
  }
}

//pages
class TextPage extends Question {
  constructor(metadata, parent_template, question_num, template_question_num, section, is_new, parent_question, answer_index) {
    super(metadata, parent_template, question_num, template_question_num, section, is_new, parent_question);

    let text_page = this;
    let reorder_label = 'P' + this.template_question_num + ': ' + this.heading;
    this.scroll_label = 'P' + this.template_question_num;

    this.required = false;
    this.scroll_icon_src = 'lib/images/icons/icon-text_page-46x46.png';
    this.scroll_icon_error_src = 'lib/images/icons/icon-text_page-error-46x46.png';
    $(this.scroll_icon)
      .children('p')
      .html('P' + template_question_num);
    $(this.scroll_icon).children('img').attr('src', this.scroll_icon_src);
    $(this.reorder_list_item).children('img').attr('src', this.scroll_icon_src);
    $(this.reorder_list_item).children('p').html(reorder_label);

    this.view_question_DOM = DOM.new({
      tag: 'div',
      class: 'questionWrapper',
      children: [
        { tag: 'p', class: 'questionNumber', html: 'P' + template_question_num },
        { tag: 'p', class: 'questionType', html: this.type },
        { tag: 'p', class: 'headingText', html: this.heading },
      ],
    });

    this.edit_question_DOM = DOM.new({
      tag: 'div',
      class: 'questionWrapper',
      children: [
        { tag: 'p', class: 'questionNumber', html: 'P' + template_question_num },
        text_page.getHeadingField(),
        {
          tag: 'div',
          class: 'wrapper',
          style: 'padding-top: 28px',
          children: [
            {
              tag: 'button',
              class: 'buttonDeleteQuestion',
              label: 'Delete Page',
              up_action: function () {
                text_page.getDeleteQuestionForm();
              },
            },
          ],
        },
      ],
    });

    // $(this.reorder_list_item).find(".reorderQuestionText").html("P" + question_num);

    if (is_new) {
      //add new question to template
      if (!parent_template.edit_mode) parent_template.toggleView();
      let new_question = parent_template.edit_mode ? $(this.edit_question_DOM) : $(this.view_question_DOM);
      $('#questionnaire-view-template').children().not('.newQuestionModalForm').remove();
      $(new_question).appendTo($('#questionnaire-view-template'));
      $('.questionScrollIcon, .headerScrollIcon, .sectionScrollIcon, .sectionScrollContainer').removeClass('iconActive');
      $(this.scroll_icon).addClass('iconActive');

      parent_template.updateItemCount();
    } else if (parent_question && answer_index > -1) {
      this.edit_question_DOM = DOM.new({
        tag: 'div',
        class: 'questionWrapper indentLarge subQuestion',
        children: [text_page.getHeadingField()],
      });

      this.view_question_DOM = DOM.new({
        tag: 'div',
        class: 'questionWrapper indent subQuestion',
        children: [{ tag: 'p', class: 'headingText smallText', html: this.heading }],
      });

      let view_field = $(
        $(parent_question.view_question_DOM).children('.questionnaireOptions').children('.questionOption')[answer_index]
      );
      let edit_field = $($(parent_question.edit_question_DOM).children('.questionOption')[answer_index]);

      $(this.view_question_DOM).insertAfter($(view_field));
      $(this.edit_question_DOM).appendTo($(edit_field));

      $($(parent_question.edit_question_DOM).find('.buttonAddSubQuestion')[answer_index]).addClass('hidden');
      $($(parent_question.edit_question_DOM).find('.buttonDeleteSubQuestion')[answer_index]).removeClass('hidden');
    }

    this.updateEmptyFields();
  }

  getDeleteQuestionForm() {
    $('#modal-secondary').fadeIn(300);
    $('#delete-question-form').children('p').html('Delete Page?');
    $('#delete-question-form').fadeIn(300);
  }

  getResponse() {
    return null;
  }

  drawEditableResponse(container) {
    super.drawEditableResponse();
    let view = $(this.asset_edit_view);
    $(view).appendTo(container);
  }

  drawViewResponse(container) {
    super.drawViewResponse();
    let question = this;
    let parent_template = this.parent_template;
    let view = $(this.asset_view_view);
    $(view).find('p.questionNumber').html(question.scroll_label);

    if (question.hasOwnProperty('assetUuids')) {
      if (question.assetUuids) {
        if (question.assetUuids.length) {
          for (let uuid of question.assetUuids) {
            let asset = Assets.getAsset(uuid);

            // todo write parameters function to provide host and protocol
            let url =
              Parameters.deployment === 'live'
                ? 'https://rapid.apl.uw.edu' + asset.file_url
                : 'https://rapid2.apl.uw.edu' + asset.file_url;

            DOM.new({
              tag: 'img',
              class: 'embeddedAssetViewImg',
              src: url,
              parent: container,
              children: [
                {
                  tag: 'button',
                  class: 'view-embedded-asset-icon',
                  label: SVG.getEyeIcon(),
                  style: ['buttonEditItems', 'margin10'],
                  up_action: function () {
                    parent_template.getEmbeddedAssetViewer(question.id, uuid, 'map-container');
                  },
                },
              ],
              click: function () {
                // check for map view embedded asset element
                if ($('#map-info-panel .embeddedAssetViewImg').length) {
                  parent_template.getEmbeddedAssetViewer(question.id, uuid, 'map-container');
                }
              },
            });
          }
        }
      }
    }

    $(view).appendTo(container);
  }

  getAssetViewerTableCell() {
    let question = this;
    let questionnaire = this.parent_template;

    function embedded_asset_element(uuid) {
      let asset = Assets.getAsset(uuid);

      let asset_label = asset.title != null ? asset.title : asset.type.toUpperCase();

      let filename = asset_label + '.' + asset.format.toLowerCase();

      return {
        tag: 'div',
        class: 'embeddedAssetRow',
        children: [
          { tag: 'img', class: 'embeddedAsset', src: asset.file_url },
          { tag: 'p', class: 'embeddedAssetCellLabel', html: "View '<b>" + filename + '</b>' },
        ],
        click: function () {
          questionnaire.getEmbeddedAssetViewer(question.id, uuid, 'questionnaire-viewer-container');
        },
        mouseover: function (e) {
          e.stopPropagation();
          e.stopImmediatePropagation();
          clearTimeout(questionnaire.questionnaire_asset_viewer.tooltip_timer);
          $(questionnaire.questionnaire_asset_viewer.tooltip).hide();
          $(this).parent().removeClass('tooltip-visible');
        },
        mouseleave: function () {
          $(this).removeClass('embedded-asset-selected');
        },
      };
    }

    function generate_question_cell(response, allow_embedded_assets) {
      let cell_children = [
        {
          tag: 'button',
          label: SVG.getPencilSmall(),
          style: ['buttonEditItems', 'button-edit-question'],
          up_action: function () {
            questionnaire.editCompletedQuestionnaire(question.id);
          },
        },
        { tag: 'div', children: [{ tag: 'p', html: response }] },
      ];

      // no embedded assets for sub questions at this time
      if (allow_embedded_assets) {
        if (question.hasOwnProperty('assetUuids')) {
          if (question.assetUuids.length) {
            for (let uuid of question.assetUuids) cell_children.push(embedded_asset_element(uuid));
          }
        }
      }
      return { tag: 'td', class: 'multi-text-cell', children: cell_children };
    }

    let cell = generate_question_cell(question.heading, true);

    questionnaire.table_cells.push(cell);

    // questionnaire.table_cells.push(
    //     {tag: "td", class: "multi-text-cell", children: [
    //             {tag: "button", label: SVG.getPencilSmall(), style: ["buttonEditItems", "button-edit-question"], up_action: function () {
    //                     questionnaire.editCompletedQuestionnaire(question.id);
    //                 }
    //             },
    //             {tag: "div", children: [
    //                     {tag: "p", html: question.getResponse()}
    //                 ]},
    //         ]})
  }

  // getHeadingField() {
  //
  //     let question = this;
  //     let parent_template = this.parent_template;
  //
  //     return {tag: "div", class: "wrapper", children: [
  //         {tag: "p", class: "editFieldLabel", html: "Text"},
  //         {tag: "textarea", class: "questionHeading", html: this.heading, blur: function () {
  //             question.heading = $(this).val().trim();
  //             $(question.view_question_DOM).children(".headingText").html(question.heading);
  //             if (!question.heading) {
  //                 $(question.view_question_DOM).children("p.headingText").addClass("hidden");
  //             } else {
  //                 $(question.view_question_DOM).children("p.headingText").removeClass("hidden");
  //             }
  //             parent_template.save();
  //         }, keyup: function () {
  //
  //             if (parent_template.update_timer !== null) {
  //                 let input = $(this);
  //                 clearTimeout(parent_template.update_timer);
  //                 parent_template.update_timer = setTimeout(function () {
  //                     question.heading = $(input).val().trim();
  //                     $(question.view_question_DOM).children(".headingText").html(question.heading);
  //
  //                     if (!question.heading) {
  //                         $(question.view_question_DOM).children("p.headingText").addClass("hidden");
  //                     } else {
  //                         $(question.view_question_DOM).children("p.headingText").removeClass("hidden");
  //                     }
  //
  //                     question.updateEmptyContent();
  //                     parent_template.save();
  //                 }, 450)
  //             }
  //         }}
  //     ]};
  // }
}
class EndPage {
  constructor() {
    this.type = 'End';
    this.label = 'End';
    this.heading;
  }
}

export { QuestionnaireBuilder };
