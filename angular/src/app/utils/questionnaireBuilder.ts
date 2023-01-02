import * as $ from 'jquery';
import * as uuidv4 from 'uuid/v4';
import * as L from 'leaflet';

/** DOM creation helper library
 * This is very basic library that is effectively a wrapper around 'document.createElement'
 *
 * **/

function getNextChar(char) {
  return String.fromCharCode(char.charCodeAt(0) + 1);
}

function DOM() {}

//flat list of all DOM IDs for reference
DOM.items = {};

//supported attributes for each html type
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
  form: ['id', 'class', 'method', 'action', 'enctype', 'style'],
  video: ['id', 'class', 'src', 'type', 'controls'],
};

/** Main method for creating new DOM objects using this library **/
DOM.new = function (params) {
  // pass in a parameters JSON object contains html attributes
  // i.e DOM.new({tag: "div"}) creates an empty div

  let object = DOM.createElement(params);
  if (params['id']) DOM.items[params['id']] = object;
  if (params['parent']) $(object).appendTo($(params['parent']));

  // add a child DOM element by adding a parameters JSON object to the children property
  // i.e. DOM.new({tag: "div", children: [{tag: "div"}, {tag: "p", html: "test"}]})
  // creates a div with two children, an empty div and a p with innerHTML 'test'

  // note the children property for the params JSON expects an array, even with a single child element

  if (params['children']) {
    for (let child of params['children']) {
      if (child) object.appendChild(DOM.new(child));
    }
  }

  if (object) return object;
};

DOM.createElement = function (params) {
  let object = null;
  if (params) {
    if (params['tag'] in DOM.TAG_ATTRIBUTES) object = DOM.createTag(params);
  }
  return object;
};

DOM.createTag = function (params) {
  if (params) {
    let object = document.createElement(params['tag']);
    if (params['html']) object.innerHTML = params.html;
    // if (params["tag"] === "input") object.onclick = function () {
    //     Utils.configureInput(event, $(this));
    // };

    //attributes
    for (let param in params) {
      if (DOM.TAG_ATTRIBUTES[params['tag']].includes(param))
        object.setAttribute(param, params[param]);
    }

    //mouse events
    if (DOM.TAG_ATTRIBUTES[params['tag']].includes('events')) {
      if (params['click']) object.addEventListener('click', params['click']);
      if (params['down']) object.addEventListener('down', params['down']);
      if (params['up']) object.addEventListener('up', params['up']);
      if (params['dblclick'])
        object.addEventListener('dblclick', params['dblclick']);
      if (params['keydown'])
        object.addEventListener('keydown', params['keydown']);
      if (params['mouseup'])
        object.addEventListener('mouseup', params['mouseup']);
      if (params['mousedown'])
        object.addEventListener('mousedown', params['mousedown']);
      if (params['mouseout'])
        object.addEventListener('mouseout', params['mouseout']);
      if (params['mouseleave'])
        object.addEventListener('mouseleave', params['mouseleave']);
      if (params['multiple']) object.setAttribute('multiple', '');
      if (params['mouseover'])
        object.addEventListener('mouseover', params['mouseover']);
      if (params['scroll']) object.addEventListener('scroll', params['scroll']);
      if (params['focus']) object.addEventListener('focus', params['focus']);
      if (params['dragstart'])
        object.addEventListener('dragstart', params['dragstart']);
      if (params['dragend'])
        object.addEventListener('dragend', params['dragend']);
      if (params['dragleave'])
        object.addEventListener('dragleave', params['dragleave']);
      if (params['scroll']) object.addEventListener('scroll', params['scroll']);
      if (params['input']) object.addEventListener('input', params['input']);

      //need to fix this so that only fires on enter, not on all keydowns
      if (params['enter']) object.addEventListener('keydown', params['enter']);
      if (params['blur']) object.addEventListener('blur', params['blur']);
      if (params['keyup']) object.addEventListener('keyup', params['keyup']);
    }
    if (object) return object;
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

QuestionnaireBuilder.renderQuestionnaire = function (questionnaire_json) {
  /** Method to generate read only questionnaire for viewing in DesignSafe
   *
   * Takes a json object containing questionnaire structure and responses
   *
   * Converts json object to a Questionnaire object then creates view for each question and appends to a container div
   *
   * **/

  let questionnaire = new Questionnaire(questionnaire_json);
  if (questionnaire) return questionnaire.renderView();
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

  constructor(metadata) {
    //add metadata
    let qnaire = this;
    for (let property in metadata) qnaire[property] = metadata[property];
    qnaire.num_questions = 0;

    //maps question number to question object
    qnaire.question_map = {};
    qnaire.question_id_map = {};
    qnaire.section_id_map = {};
    qnaire.sections = [];

    qnaire.MAP_ADDED_TO_PANEL = false;
    qnaire.embedded_asset_map = null;

    if (metadata.sections)
      for (let section of metadata.sections) new Section(qnaire, section);

    // list of all embedded asset uuids throughout questionnaire
    // embedded assets are added at the question level when a questionnaire is completed
    qnaire.embedded_asset_uuids = [];

    for (let question of Object.values(qnaire.question_id_map)) {
      if (!question.hasOwnProperty('assetUuids')) continue;
      // if (question.assetUuids.length) {
      //   for (let asset of question.assetUuids)
      //     qnaire.embedded_asset_uuids.push(asset);
      // }
    }
  }

  /** Method for generating read only questionnaire **/
  renderView() {
    let questionnaire = this;

    // add a section, then add all questions in section
    let section_list_item;
    let container = DOM.new({
      tag: 'div',
      class: 'view-only-questionnaire-container',
    });
    for (let section of questionnaire.sections) {
      section_list_item = $(section.view_question_DOM).clone();
      $(section_list_item).find('p.goto-label').parent().remove();
      $(section_list_item).appendTo(container);
      for (let question of section.questions) {
        question.drawViewResponse(container);
      }
    }
    return container;
  }

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
      //             if (option.sub_question) if (option.sub_question.id === id) return option.sub_question
      //         }
      //     }
      // }
    }
    return null;
  }
}

//parent types
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
  //starting with default 1 section
  constructor(parent_template, metadata) {
    if (metadata) this.metadata = metadata;
    for (let property in metadata) this[property] = metadata[property];

    // this.order = metadata.order
    this.questions = [];
    this.questions_metadata = metadata.questions;
    this.parent_template = parent_template;
    this.label = metadata.label ? metadata.label : '';

    if (!this.hasOwnProperty('go_to')) this.go_to = null;

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
    let template = this.parent_template;
    let question_num = 0;

    for (let question of this.questions_metadata) {
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
  assetUuids;

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

    for (let property in metadata) this[property] = metadata[property];
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

    //add required property if it is missing
    if (!metadata.hasOwnProperty('required')) {
      this.required = QuestionnaireBuilder.REQUIRED_DEFAULT;
      this.metadata.required = QuestionnaireBuilder.REQUIRED_DEFAULT;
    }

    if (parent_template.constructor.name === 'Questionnaire') {
      if (section) section.questions.push(this);
      this.parent_template.question_map[this.template_question_num] = this;
      this.parent_template.question_id_map[this.id] = this;
      return;
    }

    // note that any question type class that has a defined 'parent question' parameter is a SUB QUESTION
    // ONLY MULTIPLE CHOICE QUESTION TYPES HAVE SUB QUESTIONS
    //if sub question, don't create standard UI elements
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

    if (parent_template.current_question_index !== -1)
      ++parent_template.current_question_index;

    // if (!this.id) this.id = Utils.generateUUID();
    if (!this.id) this.id = uuidv4();

    section.questions.push(this);
    //add to question map
    this.parent_template.question_map[this.template_question_num] = this;
    this.parent_template.question_id_map[this.id] = this;
  }

  getSubQuestionNumber() {
    //returns the sub question number to be displayed above sub questions in view/edit mode

    let sub_question_number = '';

    if (this.is_sub_question) {
      let parent_question = this.parent_question;
      let char = 'a';

      for (let i = 0; i < this.answer_index; i++)
        // char = Utils.nextAlphabetChar(char);
        char = getNextChar(char);

      sub_question_number =
        'Q' + parent_question.template_question_num + '-' + char.toUpperCase();
    }

    return sub_question_number;
  }

  //decline options
  addDeclineOption() {
    let question = this;

    if (!question.decline) {
      question.decline = { label: 'Prefer not to answer' };
    } else {
      if (!question.decline.label)
        question.decline = { label: 'Prefer not to answer' };
    }

    question.metadata.decline = question.decline;
    $($(question.view_question_DOM).find('.buttonDecline')[0]).html(
      question.decline.label
    );
    $($(question.view_question_DOM).find('.buttonDecline')[0]).removeClass(
      'hidden'
    );
  }

  //formatting
  setTextAreaWidth() {
    let question = this;
    let max_width = 0;

    $.each(
      $(question.view_question_DOM).find('.questionOption'),
      function (index, value) {
        if ($(value).find('td p.questionnaireQuestion').width() > max_width)
          max_width = $(value).find('td p.questionnaireQuestion').width();
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
    let question_num = this.is_sub_question
      ? this.getSubQuestionNumber()
      : 'Q' + this.template_question_num;
    this.read_only_view.find('.questionNumber').first().html(question_num);
    this.read_only_view
      .find('.textFieldPlaceHolder')
      .removeClass('textFieldPlaceHolder');
  }
  getResponse() {
    //response values for assets

    // most questions use the responseString json property
    // question types that use responseIndex

    let response = '';
    if (this.responseStrings != null) {
      for (let string of this.responseStrings)
        if (string) response += this.responseStrings;
    }
    return response ? response : '';
  }

  /** !!!!! This method will need to be updated to get embedded assets to work in designsafe !!!!!  **/
  addEmbeddedAssets(container) {
    let question = this;

    if (question.hasOwnProperty('assetUuids')) {
      if (question.assetUuids) {
        if (question.assetUuids.length) {
          for (let uuid of question.assetUuids) {
            // let asset = Assets.getAsset(uuid);

            // TODO modify this url path to work with DesingSafe
            // let url =
            //   Parameters.deployment === 'live'
            //     ? 'https://rapid.apl.uw.edu' + asset.file_url
            //     : 'https://rapid2.apl.uw.edu' + asset.file_url;

            DOM.new({
              tag: 'img',
              class: 'embeddedAssetViewImg',
              // src: url,
              src: 'https://google.com',
              parent: container,
              children: [
                {
                  tag: 'button',
                  class: 'view-embedded-asset-icon',
                  // label: SVG.getEyeIcon(),
                  label: 'eye',
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

//multiple choice question types
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

    let single_answer = this;
    single_answer.is_sub_question = false;
    single_answer.view_question_DOM = null;

    let view_mode_fields = [];

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
    if (this.instructions === null) instruction_class += ' hidden';
    let required_class = 'optionsWrapper';
    if (!this.required) required_class += ' hidden';

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
      //if parent_question is defined, this is a sub question

      single_answer.is_sub_question = true;
      single_answer.parent_question = parent_question;

      view_mode_fields = [];

      for (let j = 0; j < this.options.length; j++)
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

      let instruction_class = this.instructions
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

      //not a decline
      if (answer_index > -1) {
        parent_question.options[answer_index].sub_question = this.metadata;
        view_field = $(
          $(parent_question.view_question_DOM).find('.questionOption')[
            answer_index
          ]
        );

        //decline option
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
      single_answer.addDeclineOption();
      // single_answer.addDeclineOption();
    } else {
      single_answer.decline = null;
      single_answer.metadata.decline = null;
    }
  }

  //sub questions
  createSubQuestion(metadata, parent_question, answer_index) {
    // let answer_index = parent_question.new_sub_question_index

    //pass in parent_question object to hold new sub question

    let template = this.parent_template;

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

  //answer options
  addDeclineOption() {
    let single_answer = this;
    let parent_template = this.parent_template;
    // let answer_class = (this.is_sub_question) ? "subQuestionOption declineOption" : "questionOption declineOption"

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
      ? single_answer.decline.value.toLowerCase()
      : single_answer.decline.label.toLowerCase();
    // ? Utils.formatVariableName(single_answer.decline.value)
    // : Utils.formatVariableName(single_answer.decline.label);

    let option_class = single_answer.is_sub_question
      ? 'declineOption subQuestionOption'
      : 'declineOption questionOption';
    let view_mode_selector_class = single_answer.is_sub_question
      ? '.declineOption.questionnaireSubOption'
      : '.declineOption.questionOption';
    let view_class = single_answer.is_sub_question
      ? 'declineOption questionnaireSubOption'
      : 'declineOption questionOption';

    let shape_class = 'questionOptionShape';

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
    if (single_answer.decline.sub_question)
      single_answer.createSubQuestion(
        single_answer.decline.sub_question,
        single_answer,
        -1
      );
  }

  //response values for assets
  getResponse(viewer_option?) {
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
              if (viewer_option)
                if (viewer_option === 'variable')
                  response = question.decline.value;
            } else {
              response = question.options[question.responseIndexes[0]].label;
              if (viewer_option)
                if (viewer_option === 'variable')
                  response =
                    question.options[question.responseIndexes[0]].value;
            }
          }
        }
      }
    }

    return response ? response : '';
  }
  drawViewResponse(container?) {
    super.drawViewResponse();

    let question = this;
    let view = $(question.read_only_view);
    let parent_template = question.parent_template;
    let selector_class = question.is_sub_question
      ? 'tr.questionnaireSubOption td > .questionOptionShape'
      : 'tr.questionOption td > .questionOptionShape';

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
          let sub_question = parent_template.getItemById(
            option.sub_question.id
          );
          sub_question.drawViewResponse(view);
        }
      }
      $(view).appendTo(container);
    } else {
      // remove sub questions because we will re-add them with completed answers
      let option_element =
        $(container).find('tr.questionOption')[question.answer_index];

      if ($(option_element).next().hasClass('subQuestion'))
        $(option_element).next().remove();
      $(view).insertAfter($(option_element));
    }

    /** Example of where this function is called
     * Add your embedded asset elements (such as photos)  to the DOM container after the question view
     * has been added
     * **/

    // question.addEmbeddedAssets(container)
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
    //updates view from inherited single select template to multi select UI
    //removes go-tos and replace circles with rounded squares for answer options

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

    let question = this;
    let view = $(question.read_only_view);

    let parent_template = question.parent_template;
    // let selector_class = (question.is_sub_question) ? ".questionnaireSubOption .answerBubbleViewMode" : ".questionnaireOptions td > .answerBubbleViewMode"
    let selector_class = question.is_sub_question
      ? 'tr.questionnaireSubOption td > .answerBubbleViewMode'
      : 'tr.questionOption td > .answerBubbleViewMode';

    // let selector_class = (this.is_sub_question) ? ".subQuestionOptions .answerBubbleViewMode" : ".questionnaireOptions .answerBubbleViewMode"
    let options: any = $(view).find(selector_class);

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
        $($(view).find(selector_class)[index]).addClass(
          'answerBubbleViewModeSelected'
        );
      }
    }

    if (!question.is_sub_question) {
      // sub questions
      for (let option of question.options) {
        if (option.sub_question) {
          let sub_question = parent_template.getItemById(
            option.sub_question.id
          );
          sub_question.drawViewResponse(view);
        }
      }
      $(view).appendTo(container);
    } else {
      // remove sub questions because we will re-add them with completed answers
      let option_element =
        $(container).find('tr.questionOption')[question.answer_index];
      if ($(option_element).next().hasClass('subQuestion'))
        $(option_element).next().remove();
      $(view).insertAfter($(option_element));
    }

    // question.addEmbeddedAssets(container)
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

//text entry question type
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

    let multi_text = this;
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

    //list item for reorder question panel

    if (parent_question) {
      multi_text.is_sub_question = true;
      this.parent_question = parent_question;
      this.view_question_DOM = DOM.new({
        tag: 'div',
        class: 'questionWrapper subQuestion indent',
      });

      if (answer_index > -1) {
        let view_field = $(
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

        let view_field = $(
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

    //add existing text fields
    for (let question of multi_text.questions) multi_text.createField(question);
  }

  createField(question) {
    let multi_text = this;

    let index = question
      ? multi_text.questions.indexOf(question)
      : multi_text.questions.length;

    let template = this.parent_template;

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

    if (question.decline) multi_text.addDeclineOption(index);

    multi_text.setMode(question.mode, index);
  }

  addDeclineOption(DOM_index?) {
    let multi_text = this;
    let question = multi_text.questions[DOM_index];
    let parent_template = multi_text.parent_template;

    if (!question.decline) {
      question.decline = { label: 'Prefer not to answer' };
    } else {
      if (!question.decline.label)
        question.decline = { label: 'Prefer not to answer' };
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
    let text_field_mode = mode !== undefined ? mode : 'short';
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
      let index = this.questions.indexOf(question);

      for (let i = 0; i < index; i++)
        // sub_question_char = Utils.nextAlphabetChar(sub_question_char);
        sub_question_char = getNextChar(sub_question_char);
      sub_question_number += '-' + sub_question_char.toUpperCase();
    }

    return sub_question_number;
  }

  getResponse(): any {
    //returns array of responses

    // return this.responseStrings

    let responses = [];
    for (let question of this.questions) {
      if (question.responseStrings) {
        for (let string of question.responseStrings) responses.push(string);
      } else {
        // responses.push("")
        // responses.push("")
      }
    }

    return responses.length ? responses : [''];
  }

  drawViewResponse(container?) {
    super.drawViewResponse();

    let question = this;
    let parent_template = this.parent_template;

    let view = $(this.read_only_view);
    if (!this.heading) $(view).find('p.headingText').remove();
    let responses = this.getResponse();
    let i = 0;
    for (let response of responses) {
      let item = $(view).find('.multiText .centerText').get(i);
      $(item).empty();
      DOM.new({ tag: 'p', class: 'blackText', html: response, parent: item });
      i++;
    }

    // question.addEmbeddedAssets(container)

    if (!question.is_sub_question) {
      $(view).appendTo($(container));
    } else {
      // remove sub questions because we will re-add them with completed answers
      let option_element =
        $(container).find('tr.questionOption')[question.answer_index];
      if ($(option_element).next().hasClass('subQuestion'))
        $(option_element).next().remove();
      $(view).insertAfter($(option_element));
    }
  }
}

//number fields
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

    let text_field = this;
    if (!this.mode) this.mode = 'integer';

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

    if (!this.heading)
      $(this.view_question_DOM).find('p.headingText').addClass('hidden');

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

      let view_field = $(
        $(parent_question.view_question_DOM).find('.questionOption')[
          answer_index
        ]
      );

      $(this.view_question_DOM).insertAfter($(view_field));
      parent_question.options[answer_index].sub_question = this.metadata;
    }

    if (this.decline) this.addDeclineOption();

    if (this.type === 'Number') {
      this.setMode(this.mode);
    }
  }

  addDeclineOption() {
    let question = this;
    let parent_template = question.parent_template;

    if (!question.decline) {
      question.decline = { label: 'Prefer not to answer' };
    } else {
      if (!question.decline.label)
        question.decline = { label: 'Prefer not to answer' };
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
        this.mode.word.charAt(0).toUpperCase() + this.mode.word.slice(1)
      );

    if (!this.required || !this.hasOwnProperty('required'))
      $(this.view_question_DOM).find('.optionsWrapper').hide();
  }

  drawViewResponse(container?) {
    super.drawViewResponse();

    let question = this;
    let parent_template = question.parent_template;
    let view = $(this.read_only_view);
    if (!question.heading) $(view).find('p.headingText').remove();
    let item = $(view).find('.wrapper.alignLeft');

    $(item).empty();
    DOM.new({
      tag: 'p',
      class: 'blackText',
      html: question.getResponse(),
      parent: item,
    });

    // question.addEmbeddedAssets(container)

    if (!question.is_sub_question) {
      $(view).appendTo($(container));
    } else {
      // remove sub questions because we will re-add them with completed answers
      let option_element =
        $(container).find('tr.questionOption')[question.answer_index];
      if ($(option_element).next().hasClass('subQuestion'))
        $(option_element).next().remove();
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

    if (!this.mode || this.mode === 'integer') this.mode = 'date';

    this.setMode(this.mode);
  }
}

//special question types
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

    let text_field = this;

    let instruction_class = 'instructionText';
    if (!this.instructions) instruction_class += ' hidden';

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

    if (!this.heading)
      $(this.view_question_DOM).find('p.headingText').addClass('hidden');

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

      let view_field = $(
        $(parent_question.view_question_DOM).find('.questionOption')[
          answer_index
        ]
      );

      $(this.view_question_DOM).insertAfter($(view_field));

      parent_question.options[answer_index].sub_question = this.metadata;
    }

    if (this.decline) this.addDeclineOption();
    // this.decline
    this.initMap();
  }

  addDeclineOption() {
    let question = this;
    let parent_template = question.parent_template;

    if (!question.decline) {
      question.decline = { label: 'Prefer not to answer' };
    } else {
      if (!question.decline.label)
        question.decline = { label: 'Prefer not to answer' };
    }

    $($(question.view_question_DOM).find('.buttonDecline')).html(
      question.decline.label
    );
    $($(question.view_question_DOM).find('.buttonDecline')).removeClass(
      'hidden'
    );
  }

  initMap() {
    let view_mode_map_canvas = DOM.new({
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

    //tile hack
    (function () {
      // @ts-ignore
      let originalInitTile: any = L.GridLayer.prototype._initTile;
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

    if (!this.required || !this.hasOwnProperty('required'))
      $(this.view_question_DOM).find('.optionsWrapper').hide();
  }

  getResponse() {
    let response = '';
    if (this.responseStrings) {
      if (this.responseStrings.length === 3) {
        //check for decline
        if (!this.responseStrings[0] && !this.responseStrings[1])
          return this.decline.label;

        response += 'Lat: ';
        if (this.responseStrings[0])
          response +=
            Number.parseFloat(this.responseStrings[0]).toFixed(6) + '<br>';
        response += 'Lon: ';
        if (this.responseStrings[1])
          response +=
            Number.parseFloat(this.responseStrings[1]).toFixed(6) + '<br><br>';
        if (this.responseStrings[2]) response += this.responseStrings[2];
      } else {
        for (let string of this.responseStrings) response += string + ' ';
        response = response.substring(0, response.length - 1);
      }
    }
    return response;
  }

  drawViewResponse(container?) {
    super.drawViewResponse();

    let response_timer = null;
    let question = this;
    let parent_template = question.parent_template;
    let view = $(this.read_only_view);

    $(view).find('.mapCanvas').remove();

    let view_mode_map_canvas = DOM.new({
      tag: 'div',
      class: 'mapCanvas',
      parent: $(view).find('.locationMapContainer'),
    });

    let lat = question.responseStrings[0]
      ? question.responseStrings[0]
      : 47.6468;
    let lon = question.responseStrings[1]
      ? question.responseStrings[1]
      : -122.3353;

    let view_map = L.map(view_mode_map_canvas).setView([lat, lon], 16);

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

    // question.addEmbeddedAssets(container)
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

    let range = this;
    let max = range.range.max;
    range.update_timer = null;

    let range_answers = [];

    let display_class = 'rangeAnswer';
    for (let k = 0; k < max; k++) {
      if (k + 1 === 10) display_class = 'rangeAnswerDoubleDigit';
      range_answers.push({
        tag: 'button',
        style: ['rangeAnswer'],
        children: [{ tag: 'p', class: display_class, html: k + 1 }],
      });
    }

    let instruction_class = 'instructionText';

    if (!this.instructions) instruction_class += ' hidden';

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

    if (!this.heading)
      $(this.view_question_DOM).find('p.headingText').addClass('hidden');

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
        let view_field = $(
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

        let view_field = $(
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

    if (!this.required || !this.hasOwnProperty('required'))
      $(this.view_question_DOM).find('.optionsWrapper').hide();

    if (this.decline) this.addDeclineOption();
  }

  addDeclineOption() {
    let question = this;
    let parent_template = question.parent_template;

    if (!question.decline) {
      question.decline = { label: 'Prefer not to answer' };
    } else {
      if (!question.decline.label)
        question.decline = { label: 'Prefer not to answer' };
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
          if (this.responseIndexes[0] === this.range.max)
            return this.decline.label;
          response = this.responseIndexes[0] + 1;
        }
      }
    }

    return response > -1 ? response : '';
  }

  drawViewResponse(container?) {
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

    $($(view).find('div.rangeAnswer')[question.getResponse() - 1]).addClass(
      'optionSelected'
    );

    // question.addEmbeddedAssets(container)

    if (!question.is_sub_question) {
      $(view).appendTo($(container));
    } else {
      // remove sub questions because we will re-add them with completed answers
      let option_element =
        $(container).find('tr.questionOption')[question.answer_index];
      if ($(option_element).next().hasClass('subQuestion'))
        $(option_element).next().remove();
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

    let matrix_question = this;

    let instruction_class = 'instructionText';
    if (!this.instructions) instruction_class += ' hidden';

    if (!this.mode) this.mode = 'single';

    matrix_question.view_question_DOM = null;

    //table for view mode display
    let table_rows = [];
    let table_columns_headers: any = [
      { tag: 'td', class: 'spacer', html: 'spacer' },
    ];

    //input fields for edit mode

    let option_class = 'matrixOption';
    let container_class = '.wrapper';

    table_rows.push({
      tag: 'tr',
      class: 'viewModeColumns',
      children: table_columns_headers,
    });

    //rows
    for (let j = 0; j < this.rows.length; j++) {
      let row_values = [
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

      for (let i = 0; i < this.columns.length; i++)
        row_values.push({
          tag: 'td',
          class: '',
          children: [{ tag: 'div', class: 'matrixOptionBubble', html: '' }],
        });

      table_rows.push({ tag: 'tr', children: row_values });
    }

    //columns
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

    if (!this.heading)
      $(this.view_question_DOM).find('p.headingText').addClass('hidden');

    if (this.decline) this.addDeclineOption();
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
    if (!this.required || !this.hasOwnProperty('required'))
      $(this.view_question_DOM).find('.optionsWrapper').hide();
  }

  addDeclineOption() {
    let question = this;
    let parent_template = this.parent_template;

    if (!question.decline) {
      question.decline = { label: 'Prefer not to answer' };
    } else {
      if (!question.decline.label)
        question.decline = { label: 'Prefer not to answer' };
    }

    question.metadata.decline = question.decline;
    let value = question.decline.label;
    let view_mode_column = DOM.new({
      tag: 'td',
      class: 'declineColumn',
      children: [{ tag: 'p', class: 'questionMatrixColumnLabel', html: value }],
    });

    //update json, UI
    $(view_mode_column).appendTo(
      $(question.view_question_DOM).find('.viewModeColumns')
    );
    $.each(
      $(question.view_question_DOM).find('tr').not('.viewModeColumns'),
      function (index, value) {
        let item = DOM.new({
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

    let question = this;
    let parent_template = this.parent_template;
    let view = $(question.read_only_view);

    let view_mode_rows = $(view).find('tr').not('.viewModeColumns');

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

    let option_class =
      question.mode === 'multi'
        ? '.matrixMultiOptionBubble'
        : '.matrixOptionBubble';

    for (let row in question.responseMatrixIndexes) {
      let row_responses = question.responseMatrixIndexes[row];
      if (!row_responses.length) continue;

      for (let col of row_responses) {
        let matrix_option_row = $(view_mode_rows).get(Number(row));
        let matrix_option = $($(matrix_option_row).find(option_class).get(col));

        matrix_option.addClass('optionSelected');
      }
    }

    // question.addEmbeddedAssets(container)

    $(view).appendTo(container);
  }

  getResponse(): any {
    //returns array of responses

    let matrix = this;
    let responses = [];
    if (this.responseMatrixIndexes) {
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

    return responses.length ? responses : '';
  }
}

//pages
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

      let view_field = $(
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
    let question = this;
    let view = $(this.read_only_view);
    $(view).find('p.questionNumber').html(question.scroll_label);

    // question.addEmbeddedAssets(container)

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
