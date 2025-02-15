import { LeftOutlined } from '@ant-design/icons';
import { Breadcrumb, Button, Dropdown, Menu, Modal, Space } from 'antd';
import React, { useCallback, useMemo } from 'react';

import Avatar from 'components/Avatar';
import Icon from 'components/Icon';
import InfoBox, { InfoRow } from 'components/InfoBox';
import InlineEditor from 'components/InlineEditor';
import Link from 'components/Link';
import { relativeTimeRenderer } from 'components/Table';
import TagList from 'components/TagList';
import { useStore } from 'contexts/Store';
import { paths } from 'routes/utils';
import { ModelItem } from 'types';
import { formatDatetime } from 'utils/datetime';

import css from './ModelHeader.module.scss';

interface Props {
  model: ModelItem;
  onDelete: () => void;
  onSaveDescription: (editedDescription: string) => Promise<void>
  onSaveName: (editedName: string) => Promise<void>;
  onSwitchArchive: () => void;
  onUpdateTags: (newTags: string[]) => Promise<void>;
}

const ModelHeader: React.FC<Props> = (
  {
    model, onDelete, onSwitchArchive,
    onSaveDescription, onUpdateTags, onSaveName,
  }: Props,
) => {
  const { auth: { user } } = useStore();

  const infoRows: InfoRow[] = useMemo(() => {
    return [ {
      content: (
        <Space>
          <Avatar name={model.username} />
          {`${model.username} on ${formatDatetime(model.creationTime, { format: 'MMM D, YYYY' })}`}
        </Space>
      ),
      label: 'Created by',
    },
    { content: relativeTimeRenderer(new Date(model.lastUpdatedTime)), label: 'Updated' },
    {
      content: (
        <InlineEditor
          placeholder="Add description..."
          value={model.description ?? ''}
          onSave={onSaveDescription}
        />
      ),
      label: 'Description',
    },
    {
      content: (
        <TagList
          ghost={false}
          tags={model.labels ?? []}
          onChange={onUpdateTags}
        />
      ),
      label: 'Tags',
    } ] as InfoRow[];
  }, [ model, onSaveDescription, onUpdateTags ]);

  const isDeletable = user?.isAdmin || user?.username === model.username;

  const showConfirmDelete = useCallback((model: ModelItem) => {
    Modal.confirm({
      closable: true,
      content: `Are you sure you want to delete this model "${model.name}" and all 
      of its versions from the model registry?`,
      icon: null,
      maskClosable: true,
      okText: 'Delete Model',
      okType: 'danger',
      onOk: () => onDelete(),
      title: 'Confirm Delete',
    });
  }, [ onDelete ]);

  return (
    <header className={css.base}>
      <div className={css.breadcrumbs}>
        <Breadcrumb separator="">
          <Breadcrumb.Item>
            <Link path={paths.modelList()}>
              <LeftOutlined className={css.leftIcon} />
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link path={paths.modelList()}>
              Model Registry
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Separator />
          <Breadcrumb.Item>{model.name}</Breadcrumb.Item>
        </Breadcrumb>
      </div>
      <div className={css.headerContent}>
        <div className={css.mainRow}>
          <Space className={css.nameAndIcon}>
            <Icon name="model" size="big" />
            <h1 className={css.name}>
              <InlineEditor
                placeholder="Add name..."
                value={model.name}
                onSave={onSaveName}
              />
            </h1>
          </Space>
          <Space size="small">
            <Dropdown
              overlay={(
                <Menu>
                  <Menu.Item key="switch-archive" onClick={onSwitchArchive}>
                    {model.archived ? 'Unarchive' : 'Archive'}
                  </Menu.Item>
                  <Menu.Item
                    danger
                    disabled={!isDeletable}
                    key="delete-model"
                    onClick={() => showConfirmDelete(model)}>
                    Delete
                  </Menu.Item>
                </Menu>
              )}
              trigger={[ 'click' ]}>
              <Button type="text">
                <Icon name="overflow-horizontal" size="tiny" />
              </Button>
            </Dropdown>
          </Space>
        </div>
        <InfoBox rows={infoRows} separator={false} />
      </div>
    </header>
  );
};

export default ModelHeader;
