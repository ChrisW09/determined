import { EditOutlined } from '@ant-design/icons';
import { Button, Card, Space, Tooltip } from 'antd';
import React, { useCallback, useMemo, useState } from 'react';

import handleError, { ErrorType } from 'ErrorHandler';
import { Metadata } from 'types';

import Spinner from '../Spinner';

import EditableMetadata from './EditableMetadata';

interface Props {
  metadata?: Metadata;
  onSave?: (newMetadata: Metadata) => Promise<void>;
}

const MetadataCard: React.FC<Props> = ({ metadata = {}, onSave }: Props) => {
  const [ isEditing, setIsEditing ] = useState(false);
  const [ isLoading, setIsLoading ] = useState(false);
  const [ editedMetadata, setEditedMetadata ] = useState<Metadata>(metadata ?? {});

  const metadataArray = useMemo(() => {
    return Object.entries(metadata ?? {}).map(([ key, value ]) => {
      return ({ content: value, label: key });
    });
  }, [ metadata ]);

  const editMetadata = useCallback(() => {
    setIsEditing(true);
  }, []);

  const saveMetadata = useCallback(async () => {
    try {
      setIsLoading(true);
      await onSave?.(editedMetadata);
      setIsEditing(false);
    } catch (e) {
      handleError({
        message: 'Unable to update metadata.',
        silent: true,
        type: ErrorType.Api,
      });
    }
    setIsLoading(false);
  }, [ editedMetadata, onSave ]);

  const cancelEditMetadata = useCallback(() => {
    setIsEditing(false);
  }, []);

  const showPlaceholder = useMemo(() => {
    return metadataArray.length === 0 && !isEditing;
  }, [ isEditing, metadataArray.length ]);

  return (
    <Card
      bodyStyle={{ padding: 'var(--theme-sizes-layout-big)' }}
      extra={isEditing ? (
        <Space size="small">
          <Button size="small" onClick={cancelEditMetadata}>Cancel</Button>
          <Button size="small" type="primary" onClick={saveMetadata}>Save</Button>
        </Space>
      ) : (
        <Tooltip title="Edit">
          <EditOutlined onClick={editMetadata} />
        </Tooltip>
      )}
      headStyle={{ paddingInline: 'var(--theme-sizes-layout-big)' }}
      title={'Metadata'}>
      {showPlaceholder ? (
        <div
          style={{ color: 'var(--theme-colors-monochrome-9)', fontStyle: 'italic' }}
          onClick={editMetadata}>
          Add Metadata...
        </div>
      ) : (
        <Spinner spinning={isLoading}>
          <EditableMetadata
            editing={isEditing}
            metadata={editedMetadata}
            updateMetadata={setEditedMetadata}
          />
        </Spinner>
      )}
    </Card>
  );
};

export default MetadataCard;
