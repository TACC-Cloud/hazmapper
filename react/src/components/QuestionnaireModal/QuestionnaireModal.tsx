import React, { useEffect, useRef } from 'react';
import { Modal, Layout, Flex, Alert } from 'antd';
import { Feature } from '../../types';
import {
  useFeatureAssetSource,
  useFeatureAssetSourcePath,
} from '@hazmapper/hooks';
import { shortDisplayText } from '@hazmapper/utils/featureUtils';
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
  const { Header } = Layout;

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

  const displayName = shortDisplayText(feature);

  return (
    <Modal
      open={isOpen}
      onCancel={close}
      loading={isLoading}
      width={800}
      footer={null}
      title={
        <Header style={{ height: 'fit-content' }}>
          Questionnaire: {displayName}
        </Header>
      }
    >
      <Flex vertical flex={1} style={{ minHeight: '20vh', maxHeight: '70vh' }}>
        {!isError ? (
          <div className={styles.questionnaireViewContainer}>
            <div id="questionnaire-view" ref={questionnaireRef} />
          </div>
        ) : (
          isError && (
            <Flex justify="center" align="center" flex={1}>
              <Alert
                type="error"
                message={`Error loading questionnaire: ${error.message}`}
              />
            </Flex>
          )
        )}
      </Flex>
    </Modal>
  );
};

export default QuestionnaireModal;
