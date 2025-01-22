import React, { useEffect, useRef } from 'react';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import { LoadingSpinner, SectionMessage } from '@tacc/core-components';
import { Feature } from '../../types';
import {
  useFeatureAssetSource,
  useFeatureAssetSourcePath,
} from '@hazmapper/hooks';
import { QuestionnaireBuilder } from './questionnaireBuilder';
import $ from 'jquery';
import styles from './QuestionnaireModal.module.css';

type QuestionnaireModalProps = {
  isOpen: boolean;
  close: () => void;
  feature: Feature;
};

const QuestionnaireModal = ({
  isOpen,
  close,
  feature,
}: QuestionnaireModalProps) => {
  const questionnaireRef = useRef<HTMLDivElement>(null);

  const {
    data: featureSource,
    isLoading,
    isError,
    error,
  } = useFeatureAssetSource(feature, '/questionnaire.rq');
  const getFeatureAssetSourcePath = useFeatureAssetSourcePath(feature);
  useEffect(() => {
    const loadQuestionnaire = async () => {
      try {
        if (!featureSource) return;
        const asset_path = getFeatureAssetSourcePath();
        const questionnaire = QuestionnaireBuilder.renderQuestionnaire(
          featureSource,
          asset_path
        );
        if (questionnaire) {
          $('#questionnaire-view').after(questionnaire);
        }
      } catch (error) {
        console.error('Error loading questionnaire:', error);
      }
    };

    if (isOpen && featureSource) {
      loadQuestionnaire();
    }
    return () => {
      $('#questionnaire-view').next().remove();
    };
  }, [isOpen, featureSource, getFeatureAssetSourcePath]);

  return (
    <Modal isOpen={isOpen} toggle={close} size="lg">
      <ModalHeader toggle={close}>
        Questionnaire:{' '}
        {feature?.assets?.length > 0
          ? feature.assets.map((asset) =>
              asset.display_path
                ? asset.display_path.split('/').pop()
                : (asset.id ?? feature.id)
            )
          : feature?.id}
      </ModalHeader>
      <ModalBody>
        <div className={styles.questionnaireViewContainer}>
          <div id="questionnaire-view" ref={questionnaireRef} />
        </div>
        {isLoading && <LoadingSpinner />}
        {isError && (
          <SectionMessage type="error">
            Error loading questionnaire: {error.message}
          </SectionMessage>
        )}
      </ModalBody>
    </Modal>
  );
};

export default QuestionnaireModal;
