import styles from "./index.module.less";
import { Button, Space, Tree } from "antd";
import {
  DownOutlined,
  RightOutlined,
  FolderOpenOutlined,
  FileAddOutlined,
  FolderAddOutlined
} from "@ant-design/icons";
import { useEffect, useMemo, useRef, useState } from "react";
import { appendChildren } from "./treeUtils";
import { operateActions, useAppDispatch } from "../../store";

function getFileNameFormPath(filePath: string): string {
  const lastIndex = filePath.includes("/")
    ? filePath.lastIndexOf("/")
    : filePath.lastIndexOf("\\");
  return filePath.slice(lastIndex + 1);
}

export default function WorkSpace() {
  const dispatch = useAppDispatch();
  const [expand, setExpand] = useState<boolean>(true);
  const [treeData, setTreeData] = useState<any[]>([]);
  const treeDataRef = useRef(treeData);
  treeDataRef.current = treeData;

  const [fileInfo, setFileInfo] = useState<
    | {
        filePath: string;
        fileName: string;
      }
    | undefined
  >();

  const isEmpty = useMemo(() => !treeData?.length, [treeData]);
  const [selectedNode, setSelectedNode] = useState<any>(null);

  function handleCreateNewFile () {
    appendChildren(treeDataRef.current, selectedNode?.key, [{
      key: 'xxx',
      title: 'xxx'
    }]);
  }

  function handleCreateNewDirectory () {

  }

  function handleSelectFile(filePath: string) {
    window.file.getFileContent(filePath).then((content) => {
      dispatch(
        operateActions.setBody({
          fileName: getFileNameFormPath(filePath),
          filePath,
          content,
        })
      );
    });
  }

  function loadDirectory (filePath: string) {
    const fileName = getFileNameFormPath(filePath);
    getTreeData(filePath).then(setTreeData);
    setFileInfo({
      filePath,
      fileName,
    });
  }

  function handleOpenDirectory() {
    window.file.chooseLocalDirectory().then(loadDirectory);
  }

  function handleLoadTreeData(treeNode) {
    return getTreeData(treeNode.filePath).then((children) => {
      appendChildren(treeDataRef.current, treeNode.key, children);
      const _treeData = [...treeDataRef.current];
      setTreeData(_treeData);
      return true;
    });
  }

  function getTreeData(filePath: string) {
    return window.file.getFiles(filePath).then((files) => {
      return files
        .map((x) => {
          return {
            _query: false,
            _isFile: x?.isFile,
            key: x?.filePath,
            isLeaf: x?.isFile,
            filePath: x?.filePath,
            title: (
              <div
                className={styles["tree-title"]}
                draggable={x.isFile && !x.fileName.startsWith(".")}
                onDragStart={(e) => {
                  e.preventDefault();
                  window.electron.startDrag(x?.filePath);
                }}
              >
                {x.fileName}
              </div>
            ),
          };
        })
        .sort((x) => (x.isLeaf ? 1 : -1));
    });
  }

  useEffect(() => {
    loadDirectory("/Users/tangjiahui/Desktop/electron")
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.head}>
        <Space
          className={styles.focus}
          style={{ cursor: "pointer", width: "100%", padding: "2px 8px" }}
          onClick={() => setExpand(!expand)}
          tabIndex={0}
        >
          {expand ? <DownOutlined /> : <RightOutlined />}
          {isEmpty ? "无打开的文件夹" : fileInfo?.fileName}
        </Space>
        <Space style={{ fontSize: 15 }}>
          {/*<FileAddOutlined*/}
          {/*  style={{ fontSize: 13 }}*/}
          {/*  title={'新增文件'}*/}
          {/*  onClick={handleCreateNewFile}*/}
          {/*/>*/}
          {/*<FolderAddOutlined*/}
          {/*  title={'新增文件夹'}*/}
          {/*  onClick={handleCreateNewDirectory}*/}
          {/*/>*/}
          <FolderOpenOutlined
            title={'打开文件夹'}
            onClick={handleOpenDirectory}
          />
        </Space>
      </div>

      <div style={{ display: expand ? "block" : "none" }} className={styles.body}>
        {isEmpty && (
          <div style={{ padding: "16px 32px" }}>
            <Button type="primary" block onClick={handleOpenDirectory}>
              打开文件夹
            </Button>background
          </div>
        )}
        <Tree
          style={{ paddingLeft: 16 }}
          treeData={treeData}
          loadData={handleLoadTreeData}
          onSelect={([filePath = ""]: string[] = [], {node}) => {
            if (filePath && node?._isFile) {
              setSelectedNode(node);
              handleSelectFile(filePath);
            }
          }}
        />
      </div>
    </div>
  );
}
