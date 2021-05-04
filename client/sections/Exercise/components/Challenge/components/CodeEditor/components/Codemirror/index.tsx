import { useRef, useEffect, useState } from "react";
import { EditorView, ViewUpdate } from "@codemirror/view";
import { EditorState, Compartment } from "@codemirror/state";
import { Button, KIND } from "baseui/button";
import { useStyletron } from "baseui";
import JSrunner from "javascript-code-runner";
import { Notification, KIND as TYPE } from "baseui/notification";
import { Grid, Cell } from "baseui/layout-grid";

const Codemirror: React.FC<{ initialValue: string }> = ({ initialValue }) => {
  const [state, setState] = useState({
    editorValue: "",
    outputValue: "",
    errorValue: "",
  });

  const editor = useRef<EditorView>();

  // Event listener on editor updates
  const onUpdate = () =>
    EditorView.updateListener.of((v: ViewUpdate) => {
      const doc = v.state.doc;
      const value = doc.toString();
      if (value !== state.editorValue) {
        setState({ ...state, editorValue: value });
      }
    });

  const initEditorView = async () => {
    const js = (await import("@codemirror/lang-javascript")).javascript;
    const setup = (await import("@codemirror/basic-setup")).basicSetup;
    const beautify = (await import("js-beautify")).default;
    const el = document.getElementById("editor");
    const language = new Compartment();
    editor.current = new EditorView({
      state: EditorState.create({
        doc: beautify(initialValue),
        extensions: [setup, language.of(js()), onUpdate()],
      }),

      parent: el as Element,
    });
  };

  useEffect(() => {
    initEditorView();
  }, []);

  const runCode = (code: string) => {
    const { result, message } = JSrunner(code);
    if (result) {
      setState({ ...state, outputValue: result });
    }
    if (message) {
      setState({ ...state, errorValue: message });
    }
  };

  // Component for output code from editor
  const OutputResult = () => (
    <Notification
      overrides={{
        Body: { style: { width: "auto" } },
      }}
    >
      <pre>
        <code>{state.outputValue}</code>
      </pre>
    </Notification>
  );
  const OutputError = () => (
    <Notification
      kind={TYPE.negative}
      overrides={{
        Body: { style: { width: "auto" } },
      }}
    >
      <pre>
        <code>{state.errorValue}</code>
      </pre>
    </Notification>
  );
  const resetCode = () => {
    editor.current?.destroy();
    initEditorView();
  };

  const [css, theme] = useStyletron();

  return (
    <Grid gridMargins={0}>
      <Cell span={[4, 8, 12]}>
        <div
          className={css({
            ...theme.borders.border600,
            fontSize: theme.sizing.scale550,
            width: "100%",
            height: "350px",
          })}
          id="editor"
        ></div>
      </Cell>
      <Cell span={[4, 8, 7]}>
        {state.errorValue ? <OutputError /> : null}
        {state.outputValue ? <OutputResult /> : null}
      </Cell>
      <Cell
        span={[4, 8, 5]}
        overrides={{
          Cell: {
            style: () => ({
              textAlign: "right",
            }),
          },
        }}
      >
        <Button kind={KIND.secondary} onClick={() => resetCode()}>
          Reset
        </Button>
        <span className={css({ marginLeft: theme.sizing.scale400 })} />
        <Button onClick={() => runCode(state.editorValue)}>Run Code</Button>
      </Cell>
    </Grid>
  );
};

export default Codemirror;
