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
import { v4 as uuidv4 } from 'uuid';
import * as L from 'leaflet';

/** DOM creation helper library
 * This is very basic library that is effectively a wrapper around 'document.createElement'
 *
 * **/

function SVG() {}
// icons
SVG.getCloseOutIcon = function () {
  return (
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" class=\'buttonRemoveFile\'>' +
    '<polygon points="12,0 50,38 88,0 100,12 62,50 100,88 88,100 50,62 12,100 0,88 38,50 0,12"></polygon>' +
    '</svg>'
  );
};
SVG.getBlackCloseOutIcon = function () {
  return (
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" class=\'deleteItemIcon\'>' +
    '<polygon points="12,0 50,38 88,0 100,12 62,50 100,88 88,100 50,62 12,100 0,88 38,50 0,12"></polygon>' +
    '</svg>'
  );
};
SVG.getRedCloseOutIcon = function () {
  return (
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" class=\'buttonDeleteSubQuestionIcon\'>' +
    '<polygon points="12,0 50,38 88,0 100,12 62,50 100,88 88,100 50,62 12,100 0,88 38,50 0,12"></polygon>' +
    '</svg>'
  );
};
SVG.getGreyCloseOutIcon = function () {
  return (
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" class=\'branch-tooltip-close-icon\'>' +
    '<polygon points="12,0 50,38 88,0 100,12 62,50 100,88 88,100 50,62 12,100 0,88 38,50 0,12"></polygon>' +
    '</svg>'
  );
};
SVG.getDisabledCloseOutIcon = function () {
  return (
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" class=\'buttonRemoveFileDisabled\'>' +
    '<polygon points="12,0 50,38 88,0 100,12 62,50 100,88 88,100 50,62 12,100 0,88 38,50 0,12"></polygon>' +
    '</svg>'
  );
};

SVG.getMoveItemsIcon = function () {
  return (
    '<svg class=testSVG xlmns="http://www.w3.org/2000/svg" ' +
    'viewbox="0 0 100 100">' +
    '<polygon points="0,12 100,12 100,28 0,28"></polygon>' +
    '<polygon points="0,42 100,42 100,58 0,58"></polygon>' +
    '<polygon points="0,72 100,72 100,88 0,88"></polygon>' +
    '</svg>'
  );
};
SVG.getMoveQuestionnaireItemsIcon = function () {
  return (
    '<svg class=fillBlack xlmns="http://www.w3.org/2000/svg" ' +
    'viewbox="0 0 100 100">' +
    '<polygon points="0,12 100,12 100,28 0,28"></polygon>' +
    '<polygon points="0,42 100,42 100,58 0,58"></polygon>' +
    '<polygon points="0,72 100,72 100,88 0,88"></polygon>' +
    '</svg>'
  );
};

// generic icons
SVG.getPencil = function () {
  return (
    "<svg xmlns='http://www.w3.org/2000/svg' version='1.1'  viewBox='0 0 72.7 72.7' class='sectionEditButtonSvg'>" +
    "\t<path d='M45.1,12.4l14.6,14.7L22.7,64.3L8.1,49.6L45.1,12.4z M70.9,8.8l-6.5-6.6c-2.5-2.5-6.6-2.5-9.2,0l-6.3,6.3l14.6,14.7 " +
    "l7.3-7.3C72.8,14,72.8,10.8,70.9,8.8z M0.4,70.3c-0.3,1.2,0.8,2.3,2,2l16.3-4L4.1,53.6L0.4,70.3z'/>" +
    '</svg>'
  );
};
SVG.getPencilSmall = function () {
  return (
    "<svg xmlns='http://www.w3.org/2000/svg' version='1.1'  viewBox='0 0 72.7 72.7' class='button-edit-question-icon'>" +
    "\t<path d='M45.1,12.4l14.6,14.7L22.7,64.3L8.1,49.6L45.1,12.4z M70.9,8.8l-6.5-6.6c-2.5-2.5-6.6-2.5-9.2,0l-6.3,6.3l14.6,14.7 " +
    "l7.3-7.3C72.8,14,72.8,10.8,70.9,8.8z M0.4,70.3c-0.3,1.2,0.8,2.3,2,2l16.3-4L4.1,53.6L0.4,70.3z'/>" +
    '</svg>'
  );
};
SVG.getEyeIcon = function () {
  return (
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="sectionEditButtonSvg">\n' +
    '<path d="M15 12c0 1.654-1.346 3-3 3s-3-1.346-3-3 1.346-3 3-3 3 1.346 3 3zm9-.449s-4.252 8.449-11.985 8.449c-7.18 0-12.015-8.449-12.015-8.449s4.446-7.551 12.015-7.551c7.694 0 11.985 7.551 11.985 7.551zm-7 .449c0-2.757-2.243-5-5-5s-5 2.243-5 5 2.243 5 5 5 5-2.243 5-5z"/>\n' +
    '</svg>'
  );
};

SVG.getPdfIcon = function () {
  return (
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 648 648" class="headerIcon"> \n' +
    '<path d="M154.72,395.47V266.35h48.7q12.87,0,19.65,1.23a39,39,0,0,1,15.94,6,31.78,31.78,0,0,1,10.35,12.47,39.56,39.56,0,0,1,3.92,17.61q0,16.47-10.49,27.88T204.92,343H171.81v52.5Zm17.09-67.73h33.38q16.55,0' +
    ',23.51-6.17t7-17.35a23.33,23.33,0,0,0-4.1-13.87,19.1,19.1,0,0,0-10.78-7.62q-4.32-1.14-15.95-1.15h-33Z"/>\n' +
    '<path d="M275,395.47V266.35h44.48q15.06,0,23,1.85a43.61,43.61,0,0,1,18.93,9.25,52.41,52.41,0,0,1,15.28,22.06q5.07,13.42,5.07,30.69a90.13,90.13,0,0,1-3.44,26.07,63.36,63.36,0,0,1-8.8,18.81,47.09,47.09,0' +
    ',0,1-11.76,11.71,47.75,47.75,0,0,1-15.42,6.47,87.82,87.82,0,0,1-20.74,2.21Zm17.09-15.24h27.56q12.78,0,20-2.38a28.58,28.58,0,0,0,11.58-6.69q6.09-6.07,9.47-16.34t3.39-24.88q0-20.26-6.65-31.14t-16.16-14.57q-6.87-2.64-22.11-2.65H292.12Z"/>\n' +
    '<path d="M406.17,395.47V266.35h87.11v15.23h-70v40h60.6v15.24h-60.6v58.66Z"/>\n' +
    '<polygon points="324 646.4 430.37 540.05 366.75 540.05 366.72 438.35 281.25 438.35 281.25 540.05 217.63 540.05 324 646.4"/>\n' +
    '<path d="M381.87,21H89.06V621.4H221.23V595H115.28V47.41H362.65V216.84H532.08V595H426.77V621.4H558.94V197.63Zm7.84,169.43V69.81L511.62,190.43Z"/>\n' +
    '</svg>'
  );
};
SVG.getDownloadFileIcon = function () {
  return (
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 648 648" class="sectionEditButtonSvg"> ' +
    '<polygon points="324 646.4 430.37 540.05 366.75 540.05 366.72 438.35 281.25 438.35 281.25 540.05 217.63 540.05 324 646.4"/>' +
    '<path d="M381.87,21H89.06V621.4H221.23V595H115.28V47.41H362.65V216.84H532.08V595H426.77V621.4H558.94V197.63Zm7.84,169.43V69.81L511.62,190.43Z"/>' +
    '</svg>'
  );
};

SVG.getTrashcan = function () {
  return (
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 188.4 248.2" class="sectionEditButtonSvg"> ' +
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
    '</svg>'
  );
};
SVG.getBlackTrashcan = function () {
  return (
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 188.4 248.2" class="fillBlack"> ' +
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
    '</svg>'
  );
};

// cloud icons
SVG.getCloudIconBlack = function () {
  return (
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" class="cloudIconShared">' +
    '<path d="M622.49,193.79c-91.8,0-170.8,51.1-212.8,125.7a180.25,180.25,0,0,0-32.2-3.2c-80.3,0-147.8,51.8-172.8,123.6-3.6-.2-' +
    '7.2-1.1-10.9-1.1-101.5,0-183.8,82.3-183.8,183.7s82.3,183.8,183.8,183.8h612.5c101.4,0,183.8-82.3,183.8-183.8,0-80.3-51.8-147.9-123.6-1' +
    '72.9.1-3.7,1.1-7.2,1.1-10.9-.1-135.2-109.8-244.9-245.1-244.9Z"/>' +
    '</svg>'
  );
};
SVG.getCloudIconGrey = function () {
  return (
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" class="cloudIconLocal"> ' +
    '<path d="M622.49,255c100.6,0,181.81,85.35,183.8,181.5,1,49.83-2.6,56.2-2.6,56.2s9.3-.37,42.6,14.8c48.7,22.18,82.4,63.4,82.4,115A122.57,122.57,0,0' +
    ',1,806.19,745H193.79a122.63,122.63,0,0,1-122.5-122.5c0-66.9,48-118.83,120.6-122.5,31.79-1.61,52.1,6.33,52.1,6.33s.07-9.76,13-41C277,417,331.3,381,' +
    '375.61,377.76s66.28,9.83,66.28,9.83,1.43-8.6,21.4-38c39.5-58.16,93.6-94.6,159.2-94.6m0-61.2c-91.8,0-170.8,51.1-212.8,125.7a180.25,180.25,0,0,0-32.2-3.2c-' +
    '80.3,0-147.8,51.8-172.8,123.6-3.6-.2-7.2-1.1-10.9-1.1-101.5,0-183.8,82.3-183.8,183.7s82.3,183.8,183.8,183.8h612.5c101.4,0,183.8-82.3,183.8-183.8,0-80.3-51.8-' +
    '147.9-123.6-172.9.1-3.7,1.1-7.2,1.1-10.9-.1-135.2-109.8-244.9-245.1-244.9Z"/>' +
    '</svg>'
  );
};
SVG.getCloudIconBlackQuestionnaires = function () {
  return (
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" class="cloudIconQuestionnaireShared">' +
    '<path d="M622.49,193.79c-91.8,0-170.8,51.1-212.8,125.7a180.25,180.25,0,0,0-32.2-3.2c-80.3,0-147.8,51.8-172.8,123.6-3.6-.2-' +
    '7.2-1.1-10.9-1.1-101.5,0-183.8,82.3-183.8,183.7s82.3,183.8,183.8,183.8h612.5c101.4,0,183.8-82.3,183.8-183.8,0-80.3-51.8-147.9-123.6-1' +
    '72.9.1-3.7,1.1-7.2,1.1-10.9-.1-135.2-109.8-244.9-245.1-244.9Z"/>' +
    '</svg>'
  );
};
SVG.getCloudIconGreyQuestionnaires = function () {
  return (
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" class="cloudIconQuestionnaireLocal"> ' +
    '<path d="M622.49,255c100.6,0,181.81,85.35,183.8,181.5,1,49.83-2.6,56.2-2.6,56.2s9.3-.37,42.6,14.8c48.7,22.18,82.4,63.4,82.4,115A122.57,122.57,0,0' +
    ',1,806.19,745H193.79a122.63,122.63,0,0,1-122.5-122.5c0-66.9,48-118.83,120.6-122.5,31.79-1.61,52.1,6.33,52.1,6.33s.07-9.76,13-41C277,417,331.3,381,' +
    '375.61,377.76s66.28,9.83,66.28,9.83,1.43-8.6,21.4-38c39.5-58.16,93.6-94.6,159.2-94.6m0-61.2c-91.8,0-170.8,51.1-212.8,125.7a180.25,180.25,0,0,0-32.2-3.2c-' +
    '80.3,0-147.8,51.8-172.8,123.6-3.6-.2-7.2-1.1-10.9-1.1-101.5,0-183.8,82.3-183.8,183.7s82.3,183.8,183.8,183.8h612.5c101.4,0,183.8-82.3,183.8-183.8,0-80.3-51.8-' +
    '147.9-123.6-172.9.1-3.7,1.1-7.2,1.1-10.9-.1-135.2-109.8-244.9-245.1-244.9Z"/>' +
    '</svg>'
  );
};
SVG.getDownloadFromCloudIcon = function () {
  return (
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" class="sectionEditButtonSvg"> \n' +
    '<polygon points="504 996.25 693.5 806.79 582.82 806.79 582.78 535.63 425.18 535.63 425.18 806.79 314.5 806.79 504 996.25"/>\n' +
    '<path d="M866.5,377.6c.1-3.7,1.1-7.2,1.1-10.9-.1-135.2-109.8-244.9-245.1-244.9-91.8,0-170.8,51.1-212.8,125.7a180.25,180.25,0,0,0-3' +
    '2.2-3.2c-80.3,0-147.8,51.8-172.8,123.6-3.6-.2-7.2-1.1-10.9-1.1C92.3,366.8,10,449.1,10,550.5S92.3,734.3,193.8,734.3h159V673h-159A122.63,12' +
    '2.63,0,0,1,71.3,550.5c0-66.9,48-118.83,120.6-122.5,31.79-1.61,52.1,6.33,52.1,6.33s.07-9.76,13-41C277,345,331.31,309,375.62,305.77s66.28,9.' +
    '83,66.28,9.83,1.43-8.6,21.4-38c39.5-58.16,93.6-94.6,159.2-94.6,100.6,0,181.81,85.35,183.8,181.5,1,49.83-2.6,56.2-2.6,56.2s9.3-.37,42.6,14.8c48.' +
    '7,22.18,82.4,63.4,82.4,115A122.57,122.57,0,0,1,806.2,673h-151v61.3H806.3c101.4,0,183.8-82.3,183.8-183.8C990.1,470.2,938.3,402.6,866.5,377.6Z"/>\n' +
    '</svg>'
  );
};

SVG.getUploadToCloudIcon = function () {
  return (
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" class="sectionEditButtonSvg"> \n' +
    '<polygon points="504 483.07 314.5 672.54 425.18 672.54 425.22 943.69 582.82 943.69 582.82 672.54 693.5 672.54 504 483.07"/>\n' +
    '<path d="M866.5,449.6c.1-3.7,1.1-7.2,1.1-10.9-.1-135.2-109.8-244.9-245.1-244.9-91.8,0-170.8,51.1-212.8,125.7a180.25,180.25,0,0,0-32.2-3.2c-80.3,' +
    '0-147.8,51.8-172.8,123.6-3.6-.2-7.2-1.1-10.9-1.1C92.3,438.8,10,521.1,10,622.5S92.3,806.3,193.8,806.3h159V745h-159A122.63,122.63,0,0,1,71.3,622.5c0-66.9,48-118.83,' +
    '120.6-122.5,31.79-1.61,52.1,6.33,52.1,6.33s.07-9.76,13-41C277,417,331.31,381,375.62,377.77s66.28,9.83,66.28,9.83,1.43-8.6,21.4-38c39.5-58.16,93.6-94.6,159.2-94.6,100.6,0,181.81,85.35,183' +
    '.8,181.5,1,49.83-2.6,56.2-2.6,56.2s9.3-.37,42.6,14.8c48.7,22.18,82.4,63.4,82.4,115A122.57,122.57,0,0,1,806.2,745h-151v61.3H806.3c101.4,0,183.8-82.3,183.8-183.8C990.1,542.2,938.3,474.6,866.5,449.6Z"/>\n' +
    '</svg>'
  );
};
SVG.getUploadToCloudIconSelected = function () {
  return (
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" class="sectionEditButtonSvgSelected"> \n' +
    '<polygon points="504 483.07 314.5 672.54 425.18 672.54 425.22 943.69 582.82 943.69 582.82 672.54 693.5 672.54 504 483.07"/>\n' +
    '<path d="M866.5,449.6c.1-3.7,1.1-7.2,1.1-10.9-.1-135.2-109.8-244.9-245.1-244.9-91.8,0-170.8,51.1-212.8,125.7a180.25,180.25,0,0,0-32.2-3.2c-80.3,' +
    '0-147.8,51.8-172.8,123.6-3.6-.2-7.2-1.1-10.9-1.1C92.3,438.8,10,521.1,10,622.5S92.3,806.3,193.8,806.3h159V745h-159A122.63,122.63,0,0,1,71.3,622.5c0-66.9,48-118.83,' +
    '120.6-122.5,31.79-1.61,52.1,6.33,52.1,6.33s.07-9.76,13-41C277,417,331.31,381,375.62,377.77s66.28,9.83,66.28,9.83,1.43-8.6,21.4-38c39.5-58.16,93.6-94.6,159.2-94.6,100.6,0,181.81,85.35,183' +
    '.8,181.5,1,49.83-2.6,56.2-2.6,56.2s9.3-.37,42.6,14.8c48.7,22.18,82.4,63.4,82.4,115A122.57,122.57,0,0,1,806.2,745h-151v61.3H806.3c101.4,0,183.8-82.3,183.8-183.8C990.1,542.2,938.3,474.6,866.5,449.6Z"/>\n' +
    '</svg>'
  );
};

// plus, minus signs
SVG.getPlusSign = function () {
  return (
    '<svg class=testSVG xlmns="http://www.w3.org/2000/svg" ' +
    'viewbox="0 0 100 100">' +
    '<polygon points="0,42 42,42 42,0 58,0 58,42 100,42 100,58 58,58 58,100 42,100 42,58 0,58"></polygon>' +
    '</svg>'
  );
};
SVG.plusSignInnerHtml = function () {
  return '0,42 42,42 42,0 58,0 58,42 100,42 100,58 58,58 58,100 42,100 42,58 0,58';
};
SVG.getMainItemPlusSign = function () {
  return (
    '<svg class=MainItemSVG xlmns="http://www.w3.org/2000/svg" ' +
    'viewbox="0 0 100 100">' +
    '<polygon points="0,42 42,42 42,0 58,0 58,42 100,42 100,58 58,58 58,100 42,100 42,58 0,58"></polygon>' +
    '</svg>'
  );
};
SVG.getBlackPlusSign = function () {
  return (
    '<svg class=fillBlack xlmns="http://www.w3.org/2000/svg" ' +
    'viewbox="0 0 100 100">' +
    '<polygon points="0,42 42,42 42,0 58,0 58,42 100,42 100,58 58,58 58,100 42,100 42,58 0,58"></polygon>' +
    '</svg>'
  );
};
SVG.getMinusSign = function () {
  return (
    '<svg class=testSVG xlmns="http://www.w3.org/2000/svg" ' +
    'viewbox="0 0 100 100">' +
    '<polygon points="0,42 100,42 100,58 0,58"></polygon>' +
    '</svg>'
  );
};
SVG.getBlackMinusSign = function () {
  return (
    '<svg class=fillBlack xlmns="http://www.w3.org/2000/svg" ' +
    'viewbox="0 0 100 100">' +
    '<polygon points="0,42 100,42 100,58 0,58"></polygon>' +
    '</svg>'
  );
};
SVG.getBlackMinusSign = function () {
  return (
    '<svg class=fillBlack xlmns="http://www.w3.org/2000/svg" ' +
    'viewbox="0 0 100 100">' +
    '<polygon points="0,42 100,42 100,58 0,58"></polygon>' +
    '</svg>'
  );
};
SVG.getRedMinusSign = function () {
  return (
    '<svg class=fillRed xlmns="http://www.w3.org/2000/svg" ' +
    'viewbox="0 0 100 100">' +
    '<polygon points="0,42 100,42 100,58 0,58"></polygon>' +
    '</svg>'
  );
};

// shapes
SVG.hexagon = function () {
  return (
    '<div class=svgContainerOuter>' +
    "<svg class=testSVG xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 88'>" +
    '<polygon points="27,3 74,3 97,44 74,84 27,84 3,44"></polygon>' +
    '<div class=svgContainerInner>' +
    "<svg class=testSVG2 xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 88'>" +
    '<polygon class=inner points="27,3 74,3 97,44 74,84 27,84 3,44"></polygon>' +
    '</svg>' +
    '<div class = svgContainerInnerMost>' +
    '<svg id="test" class= testSVG shape="leftArrow" xlmns="http://www.w3.org/2000/svg" ' +
    'viewbox="0 0 100 100">' +
    '<polygon points="0,42 42,42 42,0 58,0 58,42 100,42 100,58 58,58 58,100 42,100 42,58 0,58"></polygon>' +
    '</svg>' +
    '</div>' +
    '</div>' +
    '</svg>' +
    '</div>'
  );
};
SVG.hexagonExpanded = function () {
  return (
    '<div class=svgContainerOuter>' +
    "<svg class=testSVG xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 88'>" +
    '<polygon points="27,3 74,3 97,44 74,84 27,84 3,44"></polygon>' +
    '<div class=svgContainerInner>' +
    "<svg class=testSVG2 xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 88'>" +
    '<polygon class=inner points="27,3 74,3 97,44 74,84 27,84 3,44"></polygon>' +
    '</svg>' +
    '<div class = svgContainerInnerMost>' +
    '<svg id="test" class= testSVG shape="leftArrow" xlmns="http://www.w3.org/2000/svg" ' +
    'viewbox="0 0 100 100">' +
    '<polygon points="0,42 100,42 100,58 0,58"></polygon>' +
    '</svg>' +
    '</div>' +
    '</div>' +
    '</svg>' +
    '</div>'
  );
};
SVG.subProjectHexagon = function () {
  return (
    '<div class=svgSubContainerOuter>' +
    "<svg class=testSVG xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 88'>" +
    '<polygon points="27,3 74,3 97,44 74,84 27,84 3,44"></polygon>' +
    '<div class=svgContainerInner>' +
    "<svg class=testSVG3 xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 88'>" +
    '<polygon class=inner points="27,3 74,3 97,44 74,84 27,84 3,44"></polygon>' +
    '</svg>' +
    '</div>' +
    '</svg>' +
    '</div>'
  );
};

// questionnaire branching elements
SVG.getBranchingLine = function (height, width, is_clone, num_nodes) {
  let styles = '';
  //
  // width = SVG.line_width;
  // if (!is_clone) SVG.line_width - offset;

  //

  // if (num_nodes === 1 || num_nodes === 2) width = 125;
  // if (num_nodes === 3 || num_nodes === 4) width = 100;
  // if (num_nodes === 5 || num_nodes === 6) width = 75;
  //

  if (is_clone) {
    width += 5;
  }

  const x_offset = width + 52;

  // reflect over y axis
  if (num_nodes % 2 === 1) {
    styles +=
      ' transform: rotateY(180deg) translateX(' +
      x_offset +
      'px); margin-left: 0;';
  }

  // if (is_clone) styles += " transform: rotateY(180deg) translateX("+ (width + 52) + "px); margin-left: 0;"

  // let style = (num_nodes % 2 === 0) ? styles: "";

  const points = '0,0 ' + width + ',0 ' + width + ',' + height + ' 0,' + height;
  const arrow_points =
    '0,' + height + ' 5,' + (height - 5) + ' 5,' + (height + 5);

  // returns 3 sides line based upon starting and ending points
  // return "<svg xmlns=\"http://www.w3.org/2000/svg\" class=\"branch-line\" style=\" "+ styles+"\" preserveAspectRatio='xMinYMin'>  \n" +
  //     "  <polyline points=\" " + points + " \"/>\n" +
  //     " <polygon points=\" " + arrow_points + "\"/>" +
  //     "</svg>"

  return (
    '<svg xmlns="http://www.w3.org/2000/svg" class="branch-line" style=" ' +
    styles +
    '">  \n' +
    '<polyline points=" ' +
    points +
    ' "/>\n' +
    '</svg>'
  );

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
DOM.new = function (params) {
  // pass in a parameters JSON object contains html attributes
  // i.e DOM.new({tag: "div"}) creates an empty div

  const object = DOM.createElement(params);
  if (params.id) {
    DOM.items[params.id] = object;
  }
  if (params.parent) {
    $(object).appendTo($(params.parent));
  }

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

  if (object) {
    return object;
  }
};

DOM.createElement = function (params) {
  let object = null;
  if (params) {
    if (params.tag in DOM.TAG_ATTRIBUTES) {
      object = DOM.createTag(params);
    }
  }
  return object;
};

DOM.createTag = function (params) {
  if (params) {
    const object = document.createElement(params.tag);
    if (params.html) {
      object.innerHTML = params.html;
    }
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
      if (params.click) {
        object.addEventListener('click', params.click);
      }
      if (params.down) {
        object.addEventListener('down', params.down);
      }
      if (params.up) {
        object.addEventListener('up', params.up);
      }
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
      if (params.multiple) {
        object.setAttribute('multiple', '');
      }
      if (params.mouseover) {
        object.addEventListener('mouseover', params.mouseover);
      }
      if (params.scroll) {
        object.addEventListener('scroll', params.scroll);
      }
      if (params.focus) {
        object.addEventListener('focus', params.focus);
      }
      if (params.dragstart) {
        object.addEventListener('dragstart', params.dragstart);
      }
      if (params.dragend) {
        object.addEventListener('dragend', params.dragend);
      }
      if (params.dragleave) {
        object.addEventListener('dragleave', params.dragleave);
      }
      if (params.scroll) {
        object.addEventListener('scroll', params.scroll);
      }
      if (params.input) {
        object.addEventListener('input', params.input);
      }

      // need to fix this so that only fires on enter, not on all keydowns
      if (params.enter) {
        object.addEventListener('keydown', params.enter);
      }
      if (params.blur) {
        object.addEventListener('blur', params.blur);
      }
      if (params.keyup) {
        object.addEventListener('keyup', params.keyup);
      }
    }
    if (object) {
      return object;
    }
  }
};

DOM.appendObject = function (parent, child) {
  parent.appendChild(child);
};

function QuestionnaireBuilder() {}

QuestionnaireBuilder.NO_QUESTION_TEXT = 'No question text';
QuestionnaireBuilder.NO_ANSWER_TEXT = 'No answer text';
QuestionnaireBuilder.REQUIRED_DEFAULT = true;
QuestionnaireBuilder.ASSET_EMBEDDING_DEFAULT = true;
QuestionnaireBuilder.ALLOW_BACK_DEFAULT = true;
QuestionnaireBuilder.EDITABLE_DEFAULT = false;

QuestionnaireBuilder.renderQuestionnaire = function (
  questionnaire_json,
  asset_path
) {
  /** Method to generate read only questionnaire for viewing in DesignSafe
   *
   * Takes a json object containing questionnaire structure and responses
   *
   * Converts json object to a Questionnaire object then creates view for each question and appends to a container div
   *
   * **/

  const questionnaire = new Questionnaire(questionnaire_json, asset_path);
  if (questionnaire) {
    return questionnaire.renderView();
  }
};

class Questionnaire {
  /** view-only filled-out questionnaire object **/
  num_questions;
  question_map;
  question_id_map;
  section_id_map;
  sections;
  MAP_ADDED_TO_PANEL;
  embedded_asset_map;
  embedded_asset_uuids;
  asset_path;

  constructor(metadata, asset_path) {
    const qnaire = this;

    // add base path to assets
    qnaire.asset_path = asset_path;

    // add metadata
    for (const property in metadata) {
      qnaire[property] = metadata[property];
    }
    qnaire.num_questions = 0;

    // maps question number to question object
    qnaire.question_map = {};
    qnaire.question_id_map = {};
    qnaire.section_id_map = {};
    qnaire.sections = [];

    qnaire.MAP_ADDED_TO_PANEL = false;
    qnaire.embedded_asset_map = null;

    if (metadata.sections) {
      for (const section of metadata.sections) {
        new Section(qnaire, section);
      }
    }

    // list of all embedded asset uuids throughout questionnaire
    // embedded assets are added at the question level when a questionnaire is completed
    qnaire.embedded_asset_uuids = [];

    for (const question of Object.values(qnaire.question_id_map)) {
      if (!question.hasOwnProperty('assetUuids')) {
        continue;
      }
      // if (question.assetUuids.length) {
      //   for (let asset of question.assetUuids)
      //     qnaire.embedded_asset_uuids.push(asset);
      // }
    }
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

  getItemById(id) {
    if (this.question_id_map[id]) {
      return this.question_id_map[id];
    } else {
      for (const section of this.sections) {
        if (section.id === id) {
          return section;
        }

        for (const question of section.questions) {
          if (question.id === id) {
            return question;
          }
        }
      }

      // let has_sub_questions = ["SingleAnswer2", "MultiAnswer2", "YesNo2"]
      // //check for sub question
      // for (let section of this.sections) {
      //     for (let question of section.questions.filter(question => has_sub_questions.includes(question.constructor.name))) {
      //         for (let option of question.options) {
      //             if (option.sub_question) if (option.sub_question.id === id) return option.sub_question
      //         }
      //     }
      // }
    }
    return null;
  }
}

// parent types
class Section {
  questions;
  questions_metadata;
  parent_template;
  label;
  num;
  metadata;
  go_to;
  view_question_DOM;
  id;
  // starting with default 1 section
  constructor(parent_template, metadata) {
    if (metadata) {
      this.metadata = metadata;
    }
    for (const property in metadata) {
      this[property] = metadata[property];
    }

    // this.order = metadata.order
    this.questions = [];
    this.questions_metadata = metadata.questions;
    this.parent_template = parent_template;
    this.label = metadata.label ? metadata.label : '';

    if (!this.hasOwnProperty('go_to')) {
      this.go_to = null;
    }

    this.num = parent_template.sections.length + 1;

    this.view_question_DOM = DOM.new({
      tag: 'div',
      class: 'questionWrapper section-wrapper',
      children: [
        {
          tag: 'div',
          class: 'questionHeaderWrapper',
          children: [
            {
              tag: 'p',
              class: 'questionNumber',
              html: 'S' + this.num,
            },
            { tag: 'p', class: 'questionType', html: 'Section' },
          ],
        },
        { tag: 'p', class: 'headingText', html: this.label },
        {
          tag: 'div',
          class: 'wrapper-flex align-right',
          children: [{ tag: 'p', class: 'goto-label' }],
        },
      ],
    });

    if (parent_template.constructor.name === 'Questionnaire') {
      parent_template.sections.push(this);
      this.parent_template.section_id_map[this.id] = this;
      this.getQuestions();
      return;
    }

    parent_template.sections.push(this);

    this.parent_template.section_id_map[this.id] = this;
    this.getQuestions();
  }

  getQuestions() {
    const template = this.parent_template;
    let question_num = 0;

    for (const question of this.questions_metadata) {
      template.num_questions++;
      question_num++;
      switch (question.type) {
        case 'Text Field': {
          new MultiText(
            question,
            template,
            question_num,
            template.num_questions,
            this,
            false,
            null,
            null
          );
          break;
        }
        case 'Multi Text': {
          new MultiText(
            question,
            template,
            question_num,
            template.num_questions,
            this,
            false,
            null,
            null
          );
          break;
        }
        case 'Yes / No': {
          new YesNo(
            question,
            template,
            question_num,
            template.num_questions,
            this,
            false,
            null,
            null
          );
          break;
        }
        case 'Multi Select': {
          new MultiAnswer(
            question,
            template,
            question_num,
            template.num_questions,
            this,
            false,
            null,
            null
          );
          break;
        }
        case 'Single Select': {
          new SingleAnswer(
            question,
            template,
            question_num,
            template.num_questions,
            this,
            false,
            null,
            null
          );
          break;
        }
        case 'Matrix Multi Select':
        case 'Matrix Single Select':
        case 'Matrix': {
          new Matrix(
            question,
            template,
            question_num,
            template.num_questions,
            this,
            false
          );
          break;
        }

        case 'Number': {
          new NumberField(
            question,
            template,
            question_num,
            template.num_questions,
            this,
            false,
            null,
            null
          );
          break;
        }
        case 'DateTime': {
          new DateTime(
            question,
            template,
            question_num,
            template.num_questions,
            this,
            false,
            null,
            null
          );
          break;
        }

        case 'Location': {
          new LocationField(
            question,
            template,
            question_num,
            template.num_questions,
            this,
            false,
            null,
            null
          );
          break;
        }

        case 'Range': {
          new RangeAnswer(
            question,
            template,
            question_num,
            template.num_questions,
            this,
            false,
            null,
            null
          );
          break;
        }
        case 'Text': {
          new TextPage(
            question,
            template,
            question_num,
            template.num_questions,
            this,
            false,
            null,
            null
          );
          break;
        }
      }
    }
  }
}
class Question {
  answer_index;
  metadata;
  parent_template;
  section;
  question_num;
  template_question_num;
  view_question_DOM;
  scroll_label;
  read_only_view;
  required = QuestionnaireBuilder.REQUIRED_DEFAULT;
  is_sub_question;
  id;
  parent_question;
  decline;
  responseStrings;
  assets;

  constructor(
    metadata,
    parent_template,
    question_num,
    template_question_num,
    section,
    is_new,
    parent_question,
    answer_index
  ) {
    // if parent question is passed in, question is a sub question of parent_question

    for (const property in metadata) {
      this[property] = metadata[property];
    }
    this.answer_index = answer_index;
    this.metadata = metadata;
    this.parent_template = parent_template;
    this.section = section;
    this.question_num = question_num;
    this.template_question_num = template_question_num;
    this.metadata.num = this.template_question_num;
    this.view_question_DOM = null;
    this.scroll_label = 'Q' + this.template_question_num;

    this.read_only_view = null;

    // add required property if it is missing
    if (!metadata.hasOwnProperty('required')) {
      this.required = QuestionnaireBuilder.REQUIRED_DEFAULT;
      this.metadata.required = QuestionnaireBuilder.REQUIRED_DEFAULT;
    }

    if (parent_template.constructor.name === 'Questionnaire') {
      if (section) {
        section.questions.push(this);
      }
      this.parent_template.question_map[this.template_question_num] = this;
      this.parent_template.question_id_map[this.id] = this;
      return;
    }

    // note that any question type class that has a defined 'parent question' parameter is a SUB QUESTION
    // ONLY MULTIPLE CHOICE QUESTION TYPES HAVE SUB QUESTIONS
    // if sub question, don't create standard UI elements
    if (parent_question) {
      this.is_sub_question = true;
      $('.subQuestionModalForm').fadeOut();
      if (!this.id) {
        this.id = uuidv4();
        // this.id = Utils.generateUUID();
        this.metadata.id = this.id;
        // this.parent_template.question_id_map[this.id] = this
      }
      this.parent_template.question_id_map[this.id] = this;
      return;
    }

    if (parent_template.current_question_index !== -1) {
      ++parent_template.current_question_index;
    }

    // if (!this.id) this.id = Utils.generateUUID();
    if (!this.id) {
      this.id = uuidv4();
    }

    section.questions.push(this);
    // add to question map
    this.parent_template.question_map[this.template_question_num] = this;
    this.parent_template.question_id_map[this.id] = this;
  }

  getSubQuestionNumber() {
    // returns the sub question number to be displayed above sub questions in view/edit mode

    let sub_question_number = '';

    if (this.is_sub_question) {
      const parent_question = this.parent_question;
      let char = 'a';

      for (let i = 0; i < this.answer_index; i++) {
        // char = Utils.nextAlphabetChar(char);
        char = getNextChar(char);
      }

      sub_question_number =
        'Q' + parent_question.template_question_num + '-' + char.toUpperCase();
    }

    return sub_question_number;
  }

  // decline options
  addDeclineOption() {
    const question = this;

    if (!question.decline) {
      question.decline = { label: 'Prefer not to answer' };
    } else {
      if (!question.decline.label) {
        question.decline = { label: 'Prefer not to answer' };
      }
    }

    question.metadata.decline = question.decline;
    $($(question.view_question_DOM).find('.buttonDecline')[0]).html(
      question.decline.label
    );
    $($(question.view_question_DOM).find('.buttonDecline')[0]).removeClass(
      'hidden'
    );
  }

  // formatting
  setTextAreaWidth() {
    const question = this;
    let max_width = 0;

    $.each(
      $(question.view_question_DOM).find('.questionOption'),
      function (index, value) {
        if ($(value).find('td p.questionnaireQuestion').width() > max_width) {
          max_width = $(value).find('td p.questionnaireQuestion').width();
        }
      }
    );

    if (max_width) {
      $(question.view_question_DOM)
        .find('.questionOption')
        .children('td')
        .children('p.questionnaireQuestion')
        .css('width', max_width);
    } else {
      $(question.view_question_DOM)
        .find('.questionOption')
        .children('td')
        .children('p.questionnaireQuestion')
        .css('width', 'auto');
    }
  }

  // view only response
  drawViewResponse() {
    // note that base method does not accept a DOM container as a parameter

    // the various subclass implementations of this method will call super.drawViewResponse() to prepare the read only view
    // but also require a DOM container to append to for viewing

    this.read_only_view = $(this.view_question_DOM).clone();
    const question_num = this.is_sub_question
      ? this.getSubQuestionNumber()
      : 'Q' + this.template_question_num;
    this.read_only_view.find('.questionNumber').first().html(question_num);
    this.read_only_view
      .find('.textFieldPlaceHolder')
      .removeClass('textFieldPlaceHolder');
  }
  getResponse() {
    // response values for assets

    // most questions use the responseString json property
    // question types that use responseIndex

    let response = '';
    if (this.responseStrings != null) {
      for (const string of this.responseStrings) {
        if (string) {
          response += this.responseStrings;
        }
      }
    }
    return response ? response : '';
  }

  /** !!!!! This method will need to be updated to get embedded assets to work in designsafe !!!!!  **/
  addEmbeddedAssets(container) {
    const question = this;
    if (question.hasOwnProperty('assets')) {
      if (question.assets) {
        if (question.assets.length) {
          for (const asset of question.assets) {
            const url =
              question.parent_template.asset_path + '/' + asset.filename;

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
                },
              ],
            });
          }
        }
      }
    }
  }
}

// multiple choice question types
class SingleAnswer extends Question {
  options;
  instructions;
  responseIndexes;
  type;
  heading;
  label;
  new_sub_question_index;

  constructor(
    metadata,
    parent_template,
    question_num,
    template_question_num,
    section,
    is_new,
    parent_question,
    answer_index
  ) {
    super(
      metadata,
      parent_template,
      question_num,
      template_question_num,
      section,
      is_new,
      parent_question,
      answer_index
    );

    const single_answer = this;
    single_answer.is_sub_question = false;
    single_answer.view_question_DOM = null;

    let view_mode_fields = [];

    // answer option fields
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
            children: [
              {
                tag: 'p',
                class: 'questionnaireQuestion',
                html: this.options[j].label,
              },
            ],
          },
          {
            tag: 'td',
            children: [{ tag: 'p', class: 'goto-label' }],
          },
        ],
      });
    }

    let instruction_class = 'instructionText';
    if (this.instructions === null) {
      instruction_class += ' hidden';
    }
    let required_class = 'optionsWrapper';
    if (!this.required) {
      required_class += ' hidden';
    }

    this.view_question_DOM = DOM.new({
      tag: 'div',
      class: 'questionWrapper question-view-mode',
      children: [
        {
          tag: 'div',
          class: 'questionHeaderWrapper',
          children: [
            {
              tag: 'p',
              class: 'questionNumber',
              html: 'Q' + template_question_num,
            },
            { tag: 'p', class: 'questionType', html: this.type },
          ],
        },
        {
          tag: 'div',
          class: required_class,
          children: [
            {
              tag: 'p',
              class: 'editFieldLabel inline boldText redText',
              html: 'Required',
            },
          ],
        },
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
            {
              tag: 'div',
              class: 'questionnaireOptions alignLeft',
              children: view_mode_fields,
            },
          ],
        },
      ],
    });

    if (parent_question) {
      // if parent_question is defined, this is a sub question

      single_answer.is_sub_question = true;
      single_answer.parent_question = parent_question;

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
              children: [
                {
                  tag: 'p',
                  class: 'questionnaireQuestion',
                  html: this.options[j].label,
                },
              ],
            },
            { tag: 'td' },
          ],
        });
      }

      const instruction_class = this.instructions
        ? 'instructionText'
        : 'instructionText hidden';

      this.view_question_DOM = DOM.new({
        tag: 'div',
        class: 'wrapper indent subQuestion',
        children: [
          {
            tag: 'p',
            class: 'questionNumber',
            html: this.getSubQuestionNumber(),
          },
          {
            tag: 'div',
            class: 'optionsWrapper',
            children: [
              {
                tag: 'p',
                class: 'editFieldLabel inline boldText redText',
                html: 'Required',
              },
            ],
          },
          { tag: 'p', class: 'questionText smallText', html: this.label },
          { tag: 'p', class: instruction_class, html: this.instructions },
          {
            tag: 'div',
            children: [
              {
                tag: 'div',
                class: 'questionnairePlaceholder hidden',
                children: [
                  { tag: 'div', class: 'buttonQuestionnaireDropDown' },
                ],
              },
              {
                tag: 'div',
                class: 'questionnaireOptions alignLeft',
                children: view_mode_fields,
              },
            ],
          },
        ],
      });

      let view_field;

      // not a decline
      if (answer_index > -1) {
        parent_question.options[answer_index].sub_question = this.metadata;
        view_field = $(
          $(parent_question.view_question_DOM).find('.questionOption')[
            answer_index
          ]
        );

        // decline option
      } else if (answer_index === -1) {
        parent_question.decline.sub_question = this.metadata;
        view_field = $(
          $(parent_question.view_question_DOM).find('.questionOption').last()
        );
      }

      $(this.view_question_DOM).insertAfter($(view_field));
      $(this.view_question_DOM)
        .find('.questionOption')
        .removeClass('questionOption')
        .addClass('questionnaireSubOption');
      $(this.view_question_DOM)
        .find('.questionnaireOptions')
        .removeClass('questionnaireOptions')
        .addClass('subQuestionOptions');
    } else {
      // adding sub questions for questions that are being created from json structure
      for (let i = 0; i < this.options.length; i++) {
        if (this.options[i].sub_question) {
          const sub_question = this.options[i].sub_question;
          this.new_sub_question_index = i;
          // this.addNewSubQuestion(sub_question.type, this, i)
          this.createSubQuestion(sub_question, this, i);
        }
      }
    }

    if (single_answer.decline) {
      single_answer.addDeclineOption();
      // single_answer.addDeclineOption();
    } else {
      single_answer.decline = null;
      single_answer.metadata.decline = null;
    }
  }

  // sub questions
  createSubQuestion(metadata, parent_question, answer_index) {
    // let answer_index = parent_question.new_sub_question_index

    // pass in parent_question object to hold new sub question

    const template = this.parent_template;

    if (parent_question && metadata) {
      switch (metadata.type) {
        case 'Yes / No': {
          new YesNo(
            metadata,
            template,
            null,
            null,
            null,
            false,
            parent_question,
            answer_index
          );
          break;
        }
        case 'Single Select': {
          new SingleAnswer(
            metadata,
            template,
            null,
            null,
            null,
            false,
            parent_question,
            answer_index
          );
          break;
        }
        case 'Multi Select': {
          new MultiAnswer(
            metadata,
            template,
            null,
            null,
            null,
            false,
            parent_question,
            answer_index
          );
          break;
        }
        case 'Multi Text': {
          new MultiText(
            metadata,
            template,
            null,
            null,
            null,
            false,
            parent_question,
            answer_index
          );
          break;
        }
        case 'Range': {
          new RangeAnswer(
            metadata,
            template,
            null,
            null,
            null,
            false,
            parent_question,
            answer_index
          );
          break;
        }
        case 'Text': {
          new TextPage(
            metadata,
            template,
            null,
            null,
            null,
            false,
            parent_question,
            answer_index
          );
          break;
        }
      }
    }
  }

  // answer options
  addDeclineOption() {
    const single_answer = this;
    const parent_template = this.parent_template;
    // let answer_class = (this.is_sub_question) ? "subQuestionOption declineOption" : "questionOption declineOption"

    // default text
    if (!single_answer.decline) {
      single_answer.decline = { label: 'Prefer not to answer' };
      single_answer.metadata.decline = { label: 'Prefer not to answer' };
    } else {
      if (!single_answer.decline.label) {
        single_answer.decline = { label: 'Prefer not to answer' };
        single_answer.metadata.decline = { label: 'Prefer not to answer' };
      }
    }

    const goto_label = 'Go To';

    single_answer.decline.value = single_answer.decline.value
      ? single_answer.decline.value.toLowerCase()
      : single_answer.decline.label.toLowerCase();
    // ? Utils.formatVariableName(single_answer.decline.value)
    // : Utils.formatVariableName(single_answer.decline.label);

    const option_class = single_answer.is_sub_question
      ? 'declineOption subQuestionOption'
      : 'declineOption questionOption';
    const view_mode_selector_class = single_answer.is_sub_question
      ? '.declineOption.questionnaireSubOption'
      : '.declineOption.questionOption';
    const view_class = single_answer.is_sub_question
      ? 'declineOption questionnaireSubOption'
      : 'declineOption questionOption';

    const shape_class = 'questionOptionShape';

    const view_mode_answer = DOM.new({
      tag: 'tr',
      class: view_class,
      children: [
        {
          tag: 'td',
          children: [{ tag: 'div', class: shape_class }],
        },
        {
          tag: 'td',
          children: [
            {
              tag: 'p',
              class: 'questionnaireQuestion',
              html: single_answer.decline.label,
            },
          ],
        },
        {
          tag: 'td',
          children: [{ tag: 'p', class: 'goto-label' }],
        },
      ],
    });

    if (single_answer.is_sub_question) {
      $(view_mode_answer).appendTo(
        $(this.view_question_DOM).find('.subQuestionOptions')
      );
    } else {
      $(view_mode_answer).appendTo(
        $(this.view_question_DOM).find(
          '.dropDownViewModeContainer > .questionnaireOptions'
        )
      );
    }
    if (single_answer.decline.sub_question) {
      single_answer.createSubQuestion(
        single_answer.decline.sub_question,
        single_answer,
        -1
      );
    }
  }

  // response values for assets
  getResponse(viewer_option?) {
    const question = this;
    let response = null;

    if (question.hasOwnProperty('responseIndexes')) {
      if (question.responseIndexes != null) {
        if (question.responseIndexes.length) {
          // index of selected option
          const index = question.responseIndexes[0];

          // if index is equal to length of options array, assume decline option was selected
          if (index > -1) {
            if (index === question.options.length) {
              response = question.decline.label;
              if (viewer_option) {
                if (viewer_option === 'variable') {
                  response = question.decline.value;
                }
              }
            } else {
              response = question.options[question.responseIndexes[0]].label;
              if (viewer_option) {
                if (viewer_option === 'variable') {
                  response =
                    question.options[question.responseIndexes[0]].value;
                }
              }
            }
          }
        }
      }
    }

    return response ? response : '';
  }
  drawViewResponse(container?) {
    super.drawViewResponse();

    const question = this;
    const view = $(question.read_only_view);
    const parent_template = question.parent_template;
    const selector_class = question.is_sub_question
      ? 'tr.questionnaireSubOption td > .questionOptionShape'
      : 'tr.questionOption td > .questionOptionShape';

    if (question.responseIndexes) {
      for (const index of question.responseIndexes) {
        $($(view).find(selector_class)[index]).addClass('optionSelected');
        $(view).find(selector_class);
      }
    }

    if (!question.is_sub_question) {
      // sub questions
      for (const option of question.options) {
        if (option.sub_question) {
          const sub_question = parent_template.getItemById(
            option.sub_question.id
          );
          sub_question.drawViewResponse(view);
        }
      }
      $(view).appendTo(container);
    } else {
      // remove sub questions because we will re-add them with completed answers
      const option_element =
        $(container).find('tr.questionOption')[question.answer_index];

      if ($(option_element).next().hasClass('subQuestion')) {
        $(option_element).next().remove();
      }
      $(view).insertAfter($(option_element));
    }

    /** Example of where this function is called
     * Add your embedded asset elements (such as photos)  to the DOM container after the question view
     * has been added
     * **/

    question.addEmbeddedAssets(container);
  }
}
class MultiAnswer extends SingleAnswer {
  responseIndexes;

  constructor(
    metadata,
    parent_template,
    question_num,
    template_question_num,
    section,
    is_new,
    parent_question,
    answer_index
  ) {
    super(
      metadata,
      parent_template,
      question_num,
      template_question_num,
      section,
      is_new,
      parent_question,
      answer_index
    );

    this.updateView();

    $(this.view_question_DOM)
      .find('.dropDownViewQuestionContainer')
      .removeClass('dropDownViewQuestionContainer');
    $(this.view_question_DOM).find('.questionnairePlaceholder').remove();
    $(this.view_question_DOM).find('.answerBubbleViewMode').show();
    $(this.view_question_DOM)
      .find('.answerBubbleViewMode')
      .removeClass('hidden');
  }

  addDeclineOption() {
    super.addDeclineOption();
    this.updateView();
  }

  updateView() {
    // updates view from inherited single select template to multi select UI
    // removes go-tos and replace circles with rounded squares for answer options

    if (this.is_sub_question) {
      $(this.view_question_DOM)
        .find('.questionOptionShape')
        .addClass('answerBubbleViewMode')
        .removeClass('questionOptionShape')
        .removeClass('hidden');
    } else {
      $(this.view_question_DOM)
        .find('.questionOptionShape')
        .not('.subQuestion .questionOptionShape')
        .addClass('answerBubbleViewMode')
        .removeClass('questionOptionShape');
    }
  }

  drawViewResponse(container) {
    super.drawViewResponse();

    const question = this;
    const view = $(question.read_only_view);

    const parent_template = question.parent_template;
    // let selector_class = (question.is_sub_question) ? ".questionnaireSubOption .answerBubbleViewMode" : ".questionnaireOptions td > .answerBubbleViewMode"
    const selector_class = question.is_sub_question
      ? 'tr.questionnaireSubOption td > .answerBubbleViewMode'
      : 'tr.questionOption td > .answerBubbleViewMode';

    // let selector_class = (this.is_sub_question) ? ".subQuestionOptions .answerBubbleViewMode" : ".questionnaireOptions .answerBubbleViewMode"
    const options: any = $(view).find(selector_class);

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
      for (const index of question.responseIndexes) {
        $($(view).find(selector_class)[index]).addClass(
          'answerBubbleViewModeSelected'
        );
      }
    }

    if (!question.is_sub_question) {
      // sub questions
      for (const option of question.options) {
        if (option.sub_question) {
          const sub_question = parent_template.getItemById(
            option.sub_question.id
          );
          sub_question.drawViewResponse(view);
        }
      }
      $(view).appendTo(container);
    } else {
      // remove sub questions because we will re-add them with completed answers
      const option_element =
        $(container).find('tr.questionOption')[question.answer_index];
      if ($(option_element).next().hasClass('subQuestion')) {
        $(option_element).next().remove();
      }
      $(view).insertAfter($(option_element));
    }

    question.addEmbeddedAssets(container);
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
            for (const index of this.responseIndexes) {
              if (this.options[index]) {
                if (viewer_option) {
                  if (viewer_option === 'variable') {
                    response += this.options[index].value + '<br><br>';
                  } else {
                    response += this.options[index].label + '<br><br>';
                  }
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
class YesNo extends SingleAnswer {
  constructor(
    metadata,
    parent_template,
    question_num,
    template_question_num,
    section,
    is_new,
    parent_question,
    answer_index
  ) {
    super(
      metadata,
      parent_template,
      question_num,
      template_question_num,
      section,
      is_new,
      parent_question,
      answer_index
    );
    $(this.view_question_DOM).find('.questionType').html('Yes / No');
  }
}

// text entry question type
class MultiText extends Question {
  heading: null;
  questions;
  is_decline_sub_question;

  constructor(
    metadata,
    parent_template,
    question_num,
    template_question_num,
    section,
    is_new,
    parent_question,
    answer_index
  ) {
    super(
      metadata,
      parent_template,
      question_num,
      template_question_num,
      section,
      is_new,
      parent_question,
      answer_index
    );

    const multi_text = this;
    multi_text.answer_index = answer_index;

    multi_text.is_sub_question = false;

    delete this.required;

    this.view_question_DOM = DOM.new({
      tag: 'div',
      class: 'questionWrapper viewMode',
      children: [
        {
          tag: 'div',
          class: 'questionHeaderWrapper',
          children: [
            {
              tag: 'p',
              class: 'questionNumber',
              html: 'Q' + template_question_num,
            },
            { tag: 'p', class: 'questionType', html: 'Text Field(s)' },
          ],
        },
        { tag: 'p', class: 'headingText', html: this.heading },
      ],
    });

    // list item for reorder question panel

    if (parent_question) {
      multi_text.is_sub_question = true;
      this.parent_question = parent_question;
      this.view_question_DOM = DOM.new({
        tag: 'div',
        class: 'questionWrapper subQuestion indent',
      });

      if (answer_index > -1) {
        const view_field = $(
          $(parent_question.view_question_DOM)
            .find('.questionnaireOptions')
            .children('.questionOption')[answer_index]
        );

        $(this.view_question_DOM).insertAfter($(view_field));
        $(this.view_question_DOM)
          .find('.questionOption')
          .removeClass('questionOption')
          .addClass('questionnaireSubOption');
        $(this.view_question_DOM)
          .find('.questionnaireOptions')
          .removeClass('questionnaireOptions')
          .addClass('subQuestionOptions');

        parent_question.options[answer_index].sub_question = this.metadata;
        // parent_template.updateItemCount()
      } else if (answer_index === -1) {
        this.is_decline_sub_question = true;

        parent_question.decline.sub_question = this.metadata;

        this.view_question_DOM = DOM.new({
          tag: 'div',
          class: 'questionWrapper subQuestion indent',
        });

        const view_field = $(
          $(parent_question.view_question_DOM)
            .children('.dropDownViewModeContainer')
            .children('.questionnaireOptions')
            .children('.questionOption')
            .last()
        );

        $(this.view_question_DOM).insertAfter($(view_field));
        $(this.view_question_DOM)
          .find('.questionOption')
          .removeClass('questionOption')
          .addClass('questionnaireSubOption');
        $(this.view_question_DOM)
          .find('.questionnaireOptions')
          .removeClass('questionnaireOptions')
          .addClass('subQuestionOptions');
      }
    }

    // add existing text fields
    for (const question of multi_text.questions) {
      multi_text.createField(question);
    }
  }

  createField(question) {
    const multi_text = this;

    const index = question
      ? multi_text.questions.indexOf(question)
      : multi_text.questions.length;

    const template = this.parent_template;

    if (!question) {
      // if field is being created from scratch
      question = {
        type: 'Text Field',
        required: QuestionnaireBuilder.REQUIRED_DEFAULT,
        instructions: null,
        mode: 'short',
        label: 'Response ' + (index + 1),
        value: 'response_' + (index + 1),
        decline: null,
      };
      multi_text.questions.push(question);
    }

    let instruction_class = 'instructionText';
    if (!question.instructions) {
      instruction_class += ' hidden';
    }

    let decline_class = 'buttonDecline disabled';
    let decline_label = 'Prefer not to answer';
    if (question.decline) {
      decline_label = question.decline.label;
    } else {
      decline_class += ' hidden';
    }

    const text_class = 'textFieldPlaceHolder shortAnswer';

    let required_class = 'optionsWrapper';
    if (!this.required) {
      required_class += ' hidden';
    }

    let view_mode_field = DOM.new({
      tag: 'div',
      class: 'wrapper noSidePad multiText viewMode',
      children: [
        {
          tag: 'div',
          class: required_class,
          children: [
            {
              tag: 'p',
              class: 'editFieldLabel inline boldText redText',
              html: 'Required',
            },
          ],
        },
        { tag: 'p', class: 'questionText', html: question.label },
        { tag: 'p', class: instruction_class, html: question.instructions },
        {
          tag: 'div',
          class: 'wrapper centerText',
          children: [{ tag: 'textarea', class: text_class }],
        },
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
          {
            tag: 'p',
            class: 'questionNumber',
            html: this.getSubQuestionNumber(question),
          },
          {
            tag: 'div',
            class: 'optionsWrapper',
            children: [
              {
                tag: 'p',
                class: 'editFieldLabel inline boldText redText',
                html: 'Required',
              },
            ],
          },
          { tag: 'p', class: 'questionText', html: question.label },
          { tag: 'p', class: instruction_class, html: question.instructions },
          {
            tag: 'div',
            class: 'wrapper centerText',
            children: [{ tag: 'textarea', class: text_class }],
          },
          {
            tag: 'div',
            class: 'wrapper',
            children: [{ tag: 'div', class: decline_class }],
          },
        ],
      });
    }

    if (multi_text.is_sub_question) {
      $(view_mode_field).appendTo(multi_text.view_question_DOM);

      if (multi_text.is_decline_sub_question) {
      } else {
      }
    } else {
      if ($(multi_text.view_question_DOM).find('.multiText').length) {
        $(view_mode_field).insertAfter(
          $(multi_text.view_question_DOM).find('.multiText').last()
        );
      } else {
        $(view_mode_field).insertAfter(
          $(multi_text.view_question_DOM).find('p.headingText')
        );
      }
    }

    if (question.decline) {
      multi_text.addDeclineOption(index);
    }

    multi_text.setMode(question.mode, index);
  }

  addDeclineOption(DOM_index?) {
    const multi_text = this;
    const question = multi_text.questions[DOM_index];
    const parent_template = multi_text.parent_template;

    if (!question.decline) {
      question.decline = { label: 'Prefer not to answer' };
    } else {
      if (!question.decline.label) {
        question.decline = { label: 'Prefer not to answer' };
      }
    }

    $($(multi_text.view_question_DOM).find('.buttonDecline')[DOM_index]).html(
      question.decline.label
    );
    $(
      $(multi_text.view_question_DOM).find('.buttonDecline')[DOM_index]
    ).removeClass('hidden');
  }

  setMode(mode, index) {
    let textarea_class;
    let option_index;
    const text_field_mode = mode !== undefined ? mode : 'short';
    this.questions[index].mode = text_field_mode;

    let view_mode_field;

    if (this.is_sub_question) {
      view_mode_field = $($(this.view_question_DOM).find('.multiText')[index]);
    } else {
      view_mode_field = $(
        $(this.view_question_DOM).children('.multiText')[index]
      );
    }

    switch (text_field_mode) {
      case 'short': {
        // $(this.view_question_DOM).find("p.questionType").html("Short Text")
        textarea_class = 'shortAnswer';
        option_index = 0;
        break;
      }

      case 'medium': {
        // $(this.view_question_DOM).find("p.questionType").html("Medium Text")
        textarea_class = 'mediumAnswer';
        option_index = 1;
        break;
      }

      case 'long': {
        // $(this.view_question_DOM).find("p.questionType").html("Long Text")
        textarea_class = 'longAnswer';
        option_index = 2;
        break;
      }
    }

    textarea_class += ' textFieldPlaceHolder';

    $($(view_mode_field).find('.textFieldPlaceHolder')).removeClass(
      'shortAnswer mediumAnswer longAnswer'
    );

    $($(view_mode_field).find('.textFieldPlaceHolder')).addClass(
      textarea_class
    );

    if (this.questions[index].required) {
      $(view_mode_field).find('.optionsWrapper').removeClass('hidden');
    } else {
      $(view_mode_field).find('optionsWrapper').addClass('hidden');
    }
  }

  getSubQuestionNumber(question?) {
    let sub_question_number = super.getSubQuestionNumber();

    if (sub_question_number) {
      let sub_question_char = 'a';
      const index = this.questions.indexOf(question);

      for (let i = 0; i < index; i++) {
        // sub_question_char = Utils.nextAlphabetChar(sub_question_char);
        sub_question_char = getNextChar(sub_question_char);
      }
      sub_question_number += '-' + sub_question_char.toUpperCase();
    }

    return sub_question_number;
  }

  getResponse(): any {
    // returns array of responses

    // return this.responseStrings

    const responses = [];
    for (const question of this.questions) {
      if (question.responseStrings) {
        for (const string of question.responseStrings) {
          responses.push(string);
        }
      } else {
        // responses.push("")
        // responses.push("")
      }
    }

    return responses.length ? responses : [''];
  }

  drawViewResponse(container?) {
    super.drawViewResponse();

    const question = this;
    const parent_template = this.parent_template;

    const view = $(this.read_only_view);
    if (!this.heading) {
      $(view).find('p.headingText').remove();
    }
    const responses = this.getResponse();
    let i = 0;
    for (const response of responses) {
      const item = $(view).find('.multiText .centerText').get(i);
      $(item).empty();
      DOM.new({ tag: 'p', class: 'blackText', html: response, parent: item });
      i++;
    }

    question.addEmbeddedAssets(container);

    if (!question.is_sub_question) {
      $(view).appendTo($(container));
    } else {
      // remove sub questions because we will re-add them with completed answers
      const option_element =
        $(container).find('tr.questionOption')[question.answer_index];
      if ($(option_element).next().hasClass('subQuestion')) {
        $(option_element).next().remove();
      }
      $(view).insertAfter($(option_element));
    }
  }
}

// number fields
class NumberField extends Question {
  mode;
  type;
  heading: null;
  label;
  instructions;

  constructor(
    metadata,
    parent_template,
    question_num,
    template_question_num,
    section,
    is_new,
    parent_question,
    answer_index
  ) {
    super(
      metadata,
      parent_template,
      question_num,
      template_question_num,
      section,
      is_new,
      parent_question,
      answer_index
    );

    const text_field = this;
    if (!this.mode) {
      this.mode = 'integer';
    }

    let instruction_class = 'instructionText';
    instruction_class += ' hidden';

    this.view_question_DOM = DOM.new({
      tag: 'div',
      class: 'questionWrapper',
      children: [
        {
          tag: 'div',
          class: 'questionHeaderWrapper',
          children: [
            {
              tag: 'p',
              class: 'questionNumber',
              html: 'Q' + template_question_num,
            },
            { tag: 'p', class: 'questionType', html: this.type },
          ],
        },
        {
          tag: 'div',
          class: 'optionsWrapper',
          children: [
            {
              tag: 'p',
              class: 'editFieldLabel inline boldText redText',
              html: 'Required',
            },
          ],
        },
        { tag: 'p', class: 'headingText', html: this.heading },
        { tag: 'p', class: 'questionText', html: this.label },
        { tag: 'p', class: instruction_class, html: this.instructions },
        {
          tag: 'div',
          class: 'wrapper alignLeft',
          children: [
            {
              tag: 'textarea',
              class: 'shortAnswer textFieldPlaceHolder',
              value: 'Please enter a date',
            },
          ],
        },
        {
          tag: 'div',
          class: 'wrapper',
          children: [
            {
              tag: 'div',
              class: 'buttonDecline disabled hidden',
              html: 'Prefer not to answer',
            },
          ],
        },
      ],
    });

    if (!this.heading) {
      $(this.view_question_DOM).find('p.headingText').addClass('hidden');
    }

    if (parent_question && answer_index > -1) {
      this.view_question_DOM = DOM.new({
        tag: 'div',
        class: 'questionWrapper subQuestion indent',
        children: [
          {
            tag: 'p',
            class: 'questionNumber',
            html: this.getSubQuestionNumber(),
          },
          { tag: 'p', class: 'questionText smallText', html: this.label },
          {
            tag: 'div',
            class: 'wrapper alignLeft',
            children: [
              { tag: 'textarea', class: 'numberField textFieldPlaceHolder' },
            ],
          },
        ],
      });

      const view_field = $(
        $(parent_question.view_question_DOM).find('.questionOption')[
          answer_index
        ]
      );

      $(this.view_question_DOM).insertAfter($(view_field));
      parent_question.options[answer_index].sub_question = this.metadata;
    }

    if (this.decline) {
      this.addDeclineOption();
    }

    if (this.type === 'Number') {
      this.setMode(this.mode);
    }
  }

  addDeclineOption() {
    const question = this;
    const parent_template = question.parent_template;

    if (!question.decline) {
      question.decline = { label: 'Prefer not to answer' };
    } else {
      if (!question.decline.label) {
        question.decline = { label: 'Prefer not to answer' };
      }
    }

    $($(question.view_question_DOM).find('.buttonDecline')).html(
      question.decline.label
    );
    $($(question.view_question_DOM).find('.buttonDecline')).removeClass(
      'hidden'
    );
  }

  setMode(mode) {
    let textarea_class;
    let option_index;
    this.mode = mode;
    this.metadata.mode = mode;

    let label;
    textarea_class = 'numberField';

    switch (mode) {
      case 'integer': {
        label =
          this.label === 'Please enter a decimal'
            ? 'Please enter an integer'
            : this.label
              ? this.label
              : '';
        textarea_class = 'numberField';
        option_index = 0;
        break;
      }

      case 'decimal': {
        label =
          this.label === 'Please enter an integer'
            ? 'Please enter a decimal'
            : this.label
              ? this.label
              : '';
        textarea_class = 'numberField';
        option_index = 1;
        break;
      }
    }

    textarea_class += ' textFieldPlaceHolder';
    this.label = label;
    $(this.view_question_DOM).find('.questionText').html(label);
    $(this.view_question_DOM)
      .find('.questionType')
      .html(
        // Utils.capitalize(this.mode)
        this.mode.word
          ? this.mode.word.charAt(0).toUpperCase() + this.mode.word.slice(1)
          : 'test'
      );

    if (!this.required || !this.hasOwnProperty('required')) {
      $(this.view_question_DOM).find('.optionsWrapper').hide();
    }
  }

  drawViewResponse(container?) {
    super.drawViewResponse();

    const question = this;
    const parent_template = question.parent_template;
    const view = $(this.read_only_view);
    if (!question.heading) {
      $(view).find('p.headingText').remove();
    }
    const item = $(view).find('.wrapper.alignLeft');

    $(item).empty();
    DOM.new({
      tag: 'p',
      class: 'blackText',
      html: question.getResponse(),
      parent: item,
    });

    question.addEmbeddedAssets(container);

    if (!question.is_sub_question) {
      $(view).appendTo($(container));
    } else {
      // remove sub questions because we will re-add them with completed answers
      const option_element =
        $(container).find('tr.questionOption')[question.answer_index];
      if ($(option_element).next().hasClass('subQuestion')) {
        $(option_element).next().remove();
      }
      $(view).insertAfter($(option_element));
    }
  }
}
class DateTime extends NumberField {
  constructor(
    metadata,
    parent_template,
    question_num,
    template_question_num,
    section,
    is_new,
    parent_question,
    answer_index
  ) {
    super(
      metadata,
      parent_template,
      question_num,
      template_question_num,
      section,
      is_new,
      parent_question,
      answer_index
    );

    const datetime = this;

    const mode_selector = DOM.new({
      tag: 'div',
      class: 'modeSelector',
      children: [
        {
          tag: 'div',
          class: 'modeOption',
          html: 'Date',
          click() {
            datetime.setMode('date');
          },
        },
        {
          tag: 'div',
          class: 'modeOption',
          html: 'Time',
          click() {
            datetime.setMode('time');
          },
        },
      ],
    });

    if (!this.mode || this.mode === 'integer') {
      this.mode = 'date';
    }

    this.setMode(this.mode);
  }
}

// special question types
class LocationField extends Question {
  mode;
  type;
  heading: null;
  label;
  instructions;
  decline;
  view_mode_map;

  constructor(
    metadata,
    parent_template,
    question_num,
    template_question_num,
    section,
    is_new,
    parent_question,
    answer_index
  ) {
    super(
      metadata,
      parent_template,
      question_num,
      template_question_num,
      section,
      is_new,
      parent_question,
      answer_index
    );

    const text_field = this;

    let instruction_class = 'instructionText';
    if (!this.instructions) {
      instruction_class += ' hidden';
    }

    this.view_question_DOM = DOM.new({
      tag: 'div',
      class: 'questionWrapper',
      children: [
        {
          tag: 'div',
          class: 'questionHeaderWrapper',
          children: [
            {
              tag: 'p',
              class: 'questionNumber',
              html: 'Q' + template_question_num,
            },
            { tag: 'p', class: 'questionType', html: this.type },
          ],
        },
        {
          tag: 'div',
          class: 'optionsWrapper',
          children: [
            {
              tag: 'p',
              class: 'editFieldLabel inline boldText redText',
              html: 'Required',
            },
          ],
        },
        { tag: 'p', class: 'headingText', html: this.heading },
        { tag: 'p', class: 'questionText', html: this.label },
        { tag: 'p', class: instruction_class, html: this.instructions },
        {
          tag: 'div',
          class: 'wrapper alignLeft',
          children: [
            {
              tag: 'div',
              class: 'editModeMap locationMapContainer',
              children: [{ tag: 'div', class: 'mapSelectionIcon' }],
            },
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
          children: [
            {
              tag: 'div',
              class: 'buttonDecline disabled hidden positionLeft',
              html: 'Prefer not to answer',
            },
          ],
        },
      ],
    });

    if (!this.heading) {
      $(this.view_question_DOM).find('p.headingText').addClass('hidden');
    }

    if (parent_question && answer_index > -1) {
      this.view_question_DOM = DOM.new({
        tag: 'div',
        class: 'questionWrapper subQuestion indent',
        children: [
          { tag: 'p', class: 'questionText smallText', html: this.label },
          {
            tag: 'div',
            class: 'wrapper centerText',
            children: [
              { tag: 'textarea', class: 'shortAnswer textFieldPlaceHolder' },
            ],
          },
        ],
      });

      const view_field = $(
        $(parent_question.view_question_DOM).find('.questionOption')[
          answer_index
        ]
      );

      $(this.view_question_DOM).insertAfter($(view_field));

      parent_question.options[answer_index].sub_question = this.metadata;
    }

    if (this.decline) {
      this.addDeclineOption();
    }
    // this.decline
    this.initMap();
  }

  addDeclineOption() {
    const question = this;
    const parent_template = question.parent_template;

    if (!question.decline) {
      question.decline = { label: 'Prefer not to answer' };
    } else {
      if (!question.decline.label) {
        question.decline = { label: 'Prefer not to answer' };
      }
    }

    $($(question.view_question_DOM).find('.buttonDecline')).html(
      question.decline.label
    );
    $($(question.view_question_DOM).find('.buttonDecline')).removeClass(
      'hidden'
    );
  }

  initMap() {
    const view_mode_map_canvas = DOM.new({
      tag: 'div',
      class: 'mapCanvas',
      parent: $(this.view_question_DOM).find('.locationMapContainer'),
    });

    this.view_mode_map = L.map(view_mode_map_canvas).setView(
      [47.6468, -122.3353],
      16
    );

    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
    ).addTo(this.view_mode_map);

    // tile hack
    (function () {
      // @ts-ignore
      const originalInitTile: any = L.GridLayer.prototype._initTile;
      L.GridLayer.include({
        _initTile(tile) {
          originalInitTile.call(this, tile);

          const tileSize = this.getTileSize();

          tile.style.width = tileSize.x + 1 + 'px';
          tile.style.height = tileSize.y + 1 + 'px';
        },
      });
    })();

    this.view_mode_map.invalidateSize();

    if (!this.required || !this.hasOwnProperty('required')) {
      $(this.view_question_DOM).find('.optionsWrapper').hide();
    }
  }

  getResponse() {
    let response = '';
    if (this.responseStrings) {
      if (this.responseStrings.length === 3) {
        // check for decline
        if (!this.responseStrings[0] && !this.responseStrings[1]) {
          return this.decline.label;
        }

        response += 'Lat: ';
        if (this.responseStrings[0]) {
          response +=
            Number.parseFloat(this.responseStrings[0]).toFixed(6) + '<br>';
        }
        response += 'Lon: ';
        if (this.responseStrings[1]) {
          response +=
            Number.parseFloat(this.responseStrings[1]).toFixed(6) + '<br><br>';
        }
        if (this.responseStrings[2]) {
          response += this.responseStrings[2];
        }
      } else {
        for (const string of this.responseStrings) {
          response += string + ' ';
        }
        response = response.substring(0, response.length - 1);
      }
    }
    return response;
  }

  drawViewResponse(container?) {
    super.drawViewResponse();

    const response_timer = null;
    const question = this;
    const parent_template = question.parent_template;
    const view = $(this.read_only_view);

    $(view).find('.mapCanvas').remove();

    const view_mode_map_canvas = DOM.new({
      tag: 'div',
      class: 'mapCanvas',
      parent: $(view).find('.locationMapContainer'),
    });

    const lat = question.responseStrings[0]
      ? question.responseStrings[0]
      : 47.6468;
    const lon = question.responseStrings[1]
      ? question.responseStrings[1]
      : -122.3353;

    const view_map = L.map(view_mode_map_canvas).setView([lat, lon], 16);
    L.marker([lat, lon]).addTo(view_map);

    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
    ).addTo(view_map);

    if (question.responseStrings.length === 3) {
      $($(view).find('input.locationLatLon')[0]).val(
        question.responseStrings[0]
      );
      $($(view).find('input.locationLatLon')[1]).val(
        question.responseStrings[1]
      );
      $($(view).find('textarea.locationAddress')).html(
        question.responseStrings[2]
      );
    }

    $(view).appendTo($(container));
    view_map.invalidateSize();
    window.dispatchEvent(new Event('resize'));

    $($(view).find('textarea.locationAddress')).html(
      question.responseStrings[2]
    );

    question.addEmbeddedAssets(container);
  }
}
class RangeAnswer extends Question {
  responseIndexes;
  decline;
  range;
  update_timer;
  instructions;
  type;
  heading: null;
  label;
  is_decline_sub_question;

  constructor(
    metadata,
    parent_template,
    question_num,
    template_question_num,
    section,
    is_new,
    parent_question,
    answer_index
  ) {
    super(
      metadata,
      parent_template,
      question_num,
      template_question_num,
      section,
      is_new,
      parent_question,
      answer_index
    );

    const range = this;
    const max = range.range.max;
    range.update_timer = null;

    const range_answers = [];

    let display_class = 'rangeAnswer';
    for (let k = 0; k < max; k++) {
      if (k + 1 === 10) {
        display_class = 'rangeAnswerDoubleDigit';
      }
      range_answers.push({
        tag: 'button',
        label: SVG.getEyeIcon(),
        style: ['rangeAnswer'],
        children: [{ tag: 'p', class: display_class, html: k + 1 }],
      });
    }

    let instruction_class = 'instructionText';

    if (!this.instructions) {
      instruction_class += ' hidden';
    }

    this.view_question_DOM = DOM.new({
      tag: 'div',
      class: 'questionWrapper',
      children: [
        {
          tag: 'div',
          class: 'questionHeaderWrapper',
          children: [
            {
              tag: 'p',
              class: 'questionNumber',
              html: 'Q' + this.template_question_num,
            },
            { tag: 'p', class: 'questionType', html: this.type },
          ],
        },
        {
          tag: 'div',
          class: 'optionsWrapper',
          children: [
            {
              tag: 'p',
              class: 'editFieldLabel inline boldText redText',
              html: 'Required',
            },
          ],
        },
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
          children: [
            {
              tag: 'div',
              class: 'buttonDecline disabled hidden',
              html: 'Prefer not to answer',
            },
          ],
        },
      ],
    });

    if (!this.heading) {
      $(this.view_question_DOM).find('p.headingText').addClass('hidden');
    }

    if (parent_question) {
      range.is_sub_question = true;
      this.parent_question = parent_question;

      this.view_question_DOM = DOM.new({
        tag: 'div',
        class: 'questionWrapper indent subQuestion',
        children: [
          {
            tag: 'p',
            class: 'questionNumber',
            html: this.getSubQuestionNumber(),
          },
          { tag: 'p', class: 'questionText smallText', html: this.label },
          {
            tag: 'div',
            class: 'wrapper centerText',
            children: [
              {
                tag: 'div',
                class: 'wrapper rangeAnswers',
                children: range_answers,
              },
            ],
          },
        ],
      });

      if (answer_index > -1) {
        const view_field = $(
          $(parent_question.view_question_DOM)
            .find('.questionnaireOptions ')
            .children('.questionOption')[answer_index]
        );

        $(this.view_question_DOM).insertAfter($(view_field));

        $(this.view_question_DOM)
          .find('.questionOption')
          .removeClass('questionOption')
          .addClass('questionnaireSubOption');
        $(this.view_question_DOM)
          .find('.questionnaireOptions')
          .removeClass('questionnaireOptions')
          .addClass('subQuestionOptions');

        parent_question.options[answer_index].sub_question = this.metadata;
        // parent_template.updateItemCount()
      } else if (answer_index === -1) {
        this.is_decline_sub_question = true;

        parent_question.decline.sub_question = this.metadata;

        this.view_question_DOM = DOM.new({
          tag: 'div',
          class: 'questionWrapper subQuestion indent',
        });

        const view_field = $(
          $(parent_question.view_question_DOM)
            .children('.dropDownViewModeContainer')
            .children('.questionnaireOptions')
            .children('.questionOption')
            .last()
        );

        $(this.view_question_DOM).insertAfter($(view_field));

        $(this.view_question_DOM)
          .find('.questionOption')
          .removeClass('questionOption')
          .addClass('questionnaireSubOption');
        $(this.view_question_DOM)
          .find('.questionnaireOptions')
          .removeClass('questionnaireOptions')
          .addClass('subQuestionOptions');
      }
    }

    if (!this.required || !this.hasOwnProperty('required')) {
      $(this.view_question_DOM).find('.optionsWrapper').hide();
    }

    if (this.decline) {
      this.addDeclineOption();
    }
  }

  addDeclineOption() {
    const question = this;
    const parent_template = question.parent_template;

    if (!question.decline) {
      question.decline = { label: 'Prefer not to answer' };
    } else {
      if (!question.decline.label) {
        question.decline = { label: 'Prefer not to answer' };
      }
    }

    $($(question.view_question_DOM).find('.buttonDecline')).html(
      question.decline.label
    );
    $($(question.view_question_DOM).find('.buttonDecline')).removeClass(
      'hidden'
    );
  }

  getResponse() {
    let response = null;

    if (this.hasOwnProperty('responseIndexes')) {
      if (this.responseIndexes != null) {
        if (this.responseIndexes.length) {
          if (this.responseIndexes[0] === this.range.max) {
            return this.decline.label;
          }
          response = this.responseIndexes[0] + 1;
        }
      }
    }

    return response > -1 ? response : '';
  }

  drawViewResponse(container?) {
    super.drawViewResponse();
    const question = this;
    const parent_template = question.parent_template;
    const view = $(this.view_question_DOM);

    $(
      $(view)
        .find('div.rangeAnswer')
        .click(function () {
          $(view).find('div.rangeAnswer').removeClass('optionSelected');
          $(this).addClass('optionSelected');
          const index = $(view).find('div.rangeAnswer').index($(this));
          question.responseIndexes = [index];
        })
    );

    $($(view).find('div.rangeAnswer')[question.getResponse() - 1]).addClass(
      'optionSelected'
    );

    question.addEmbeddedAssets(container);

    if (!question.is_sub_question) {
      $(view).appendTo($(container));
    } else {
      // remove sub questions because we will re-add them with completed answers
      const option_element =
        $(container).find('tr.questionOption')[question.answer_index];
      if ($(option_element).next().hasClass('subQuestion')) {
        $(option_element).next().remove();
      }
      $(view).insertAfter($(option_element));
    }
  }
}
class Matrix extends Question {
  type;
  label;
  heading: null;
  instructions;
  mode;
  rows;
  columns;
  responseMatrixIndexes;

  constructor(
    metadata,
    parent_template,
    question_num,
    template_question_num,
    section,
    is_new
  ) {
    super(
      metadata,
      parent_template,
      question_num,
      template_question_num,
      section,
      is_new,
      null,
      null
    );

    // default matrix question is 2x2
    // matrix questions cannot contain sub questions and they cannot be sub-questions

    const matrix_question = this;

    let instruction_class = 'instructionText';
    if (!this.instructions) {
      instruction_class += ' hidden';
    }

    if (!this.mode) {
      this.mode = 'single';
    }

    matrix_question.view_question_DOM = null;

    // table for view mode display
    const table_rows = [];
    const table_columns_headers: any = [
      { tag: 'td', class: 'spacer', html: 'spacer' },
    ];

    // input fields for edit mode

    const option_class = 'matrixOption';
    const container_class = '.wrapper';

    table_rows.push({
      tag: 'tr',
      class: 'viewModeColumns',
      children: table_columns_headers,
    });

    // rows
    for (let j = 0; j < this.rows.length; j++) {
      const row_values = [
        {
          tag: 'td',
          class: 'matrixRow',
          children: [
            {
              tag: 'p',
              class: 'questionMatrixRowLabel',
              html: this.rows[j].label,
            },
          ],
        },
      ];

      for (let i = 0; i < this.columns.length; i++) {
        row_values.push({
          tag: 'td',
          class: '',
          children: [{ tag: 'div', class: 'matrixOptionBubble', html: '' }],
        });
      }

      table_rows.push({ tag: 'tr', children: row_values });
    }

    // columns
    for (let j = 0; j < this.columns.length; j++) {
      table_columns_headers.push({
        tag: 'td',
        class: '',
        children: [
          {
            tag: 'p',
            class: 'questionMatrixColumnLabel',
            html: this.columns[j].label,
          },
        ],
      });
    }

    this.view_question_DOM = DOM.new({
      tag: 'div',
      class: 'questionWrapper',
      children: [
        {
          tag: 'div',
          class: 'questionHeaderWrapper',
          children: [
            {
              tag: 'p',
              class: 'questionNumber',
              html: 'Q' + this.template_question_num,
            },
            { tag: 'p', class: 'questionType', html: this.type },
          ],
        },
        {
          tag: 'div',
          class: 'optionsWrapper',
          children: [
            {
              tag: 'p',
              class: 'editFieldLabel inline boldText redText',
              html: 'Required',
            },
          ],
        },
        { tag: 'p', class: 'headingText', html: this.heading },
        { tag: 'p', class: 'questionText', html: this.label },
        { tag: 'p', class: instruction_class, html: this.instructions },
        {
          tag: 'div',
          class: 'wrapper',
          children: [
            {
              tag: 'table',
              class: 'matrixQuestionTable',
              children: table_rows,
            },
          ],
        },
        {
          tag: 'div',
          class: 'wrapper',
          children: [
            {
              tag: 'div',
              class: 'buttonDecline disabled hidden positionLeft',
              html: 'Prefer not to answer',
            },
          ],
        },
      ],
    });

    if (!this.heading) {
      $(this.view_question_DOM).find('p.headingText').addClass('hidden');
    }

    if (this.decline) {
      this.addDeclineOption();
    }
    this.setMode(this.mode);
  }

  setMode(mode) {
    let view_mode_class;
    let option_index;
    this.mode = mode;
    this.metadata.mode = mode;
    switch (mode) {
      case 'single': {
        $(this.view_question_DOM)
          .find('p.questionType')
          .html('Matrix Single Select');
        view_mode_class = 'matrixOptionBubble';
        option_index = 0;
        break;
      }

      case 'multi': {
        $(this.view_question_DOM)
          .find('p.questionType')
          .html('Matrix Multi Select');
        view_mode_class = 'matrixMultiOptionBubble';
        option_index = 1;
        break;
      }
    }

    $(this.view_question_DOM)
      .find('.matrixOptionBubble, .matrixMultiOptionBubble')
      .attr('class', view_mode_class);
    if (!this.required || !this.hasOwnProperty('required')) {
      $(this.view_question_DOM).find('.optionsWrapper').hide();
    }
  }

  addDeclineOption() {
    const question = this;
    const parent_template = this.parent_template;

    if (!question.decline) {
      question.decline = { label: 'Prefer not to answer' };
    } else {
      if (!question.decline.label) {
        question.decline = { label: 'Prefer not to answer' };
      }
    }

    question.metadata.decline = question.decline;
    const value = question.decline.label;
    const view_mode_column = DOM.new({
      tag: 'td',
      class: 'declineColumn',
      children: [{ tag: 'p', class: 'questionMatrixColumnLabel', html: value }],
    });

    // update json, UI
    $(view_mode_column).appendTo(
      $(question.view_question_DOM).find('.viewModeColumns')
    );
    $.each(
      $(question.view_question_DOM).find('tr').not('.viewModeColumns'),
      function (index, value) {
        const item = DOM.new({
          tag: 'td',
          class: 'declineColumn',
          children: [{ tag: 'div', class: 'matrixOptionBubble' }],
        });
        $(item).appendTo($(value));
      }
    );

    this.setMode(this.mode);
  }

  drawViewResponse(container?) {
    super.drawViewResponse();

    const question = this;
    const parent_template = this.parent_template;
    const view = $(question.read_only_view);

    const view_mode_rows = $(view).find('tr').not('.viewModeColumns');

    // $(view).find("tr .matrixOptionBubble").click(function() {
    //
    //     let row_index = $(this).parent().parent().index() - 1
    //     let col_index = $(this).parent().index() - 1
    //
    //     if ($(this).hasClass("optionSelected")) {
    //
    //         // console.log("removing class")
    //         $(this).removeClass("optionSelected")
    //
    //         if (question.responseMatrixIndexes[row_index].includes(col_index)) {
    //             let index = question.responseMatrixIndexes[row_index].indexOf(col_index)
    //             question.responseMatrixIndexes[row_index].splice(index, 1)
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
    //     // $(this).addClass("optionSelected")
    //
    // })

    const option_class =
      question.mode === 'multi'
        ? '.matrixMultiOptionBubble'
        : '.matrixOptionBubble';

    for (const row in question.responseMatrixIndexes) {
      const row_responses = question.responseMatrixIndexes[row];
      if (!row_responses.length) {
        continue;
      }

      for (const col of row_responses) {
        const matrix_option_row = $(view_mode_rows).get(Number(row));
        const matrix_option = $(
          $(matrix_option_row).find(option_class).get(col)
        );

        matrix_option.addClass('optionSelected');
      }
    }

    question.addEmbeddedAssets(container);

    $(view).appendTo(container);
  }

  getResponse(): any {
    // returns array of responses

    const matrix = this;
    const responses = [];
    if (this.responseMatrixIndexes) {
      for (const row of matrix.responseMatrixIndexes) {
        const arr = [];

        for (const index of row) {
          if (matrix.columns[index]) {
            arr.push(this.columns[index].label);
          } else if (index === matrix.columns.length) {
            // decline column selected
            arr.push(this.decline.label);
          }
        }
        responses.push(arr);
      }
    }

    return responses.length ? responses : '';
  }
}

// pages
class TextPage extends Question {
  heading;
  type;
  label;
  constructor(
    metadata,
    parent_template,
    question_num,
    template_question_num,
    section,
    is_new,
    parent_question,
    answer_index
  ) {
    super(
      metadata,
      parent_template,
      question_num,
      template_question_num,
      section,
      is_new,
      parent_question,
      answer_index
    );

    this.scroll_label = 'P' + this.template_question_num;

    this.required = false;

    this.view_question_DOM = DOM.new({
      tag: 'div',
      class: 'questionWrapper',
      children: [
        {
          tag: 'div',
          class: 'questionHeaderWrapper',
          children: [
            {
              tag: 'p',
              class: 'questionNumber',
              html: 'P' + template_question_num,
            },
            { tag: 'p', class: 'questionType', html: this.type },
          ],
        },
        { tag: 'p', class: 'headingText', html: this.heading },
      ],
    });

    if (parent_question && answer_index > -1) {
      this.view_question_DOM = DOM.new({
        tag: 'div',
        class: 'questionWrapper indent subQuestion',
        children: [
          { tag: 'p', class: 'headingText smallText', html: this.heading },
        ],
      });

      const view_field = $(
        $(parent_question.view_question_DOM)
          .children('.questionnaireOptions')
          .children('.questionOption')[answer_index]
      );
      $(this.view_question_DOM).insertAfter($(view_field));
    }
  }

  getResponse() {
    return null;
  }

  drawViewResponse(container?) {
    super.drawViewResponse();
    const question = this;
    const view = $(this.read_only_view);
    $(view).find('p.questionNumber').html(question.scroll_label);
    question.addEmbeddedAssets(container);
    $(view).appendTo(container);
  }
}
class EndPage {
  type;
  label;
  heading;
  constructor() {
    this.type = 'End';
    this.label = 'End';
    this.heading;
  }
}

export { QuestionnaireBuilder };
