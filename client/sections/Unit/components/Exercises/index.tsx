import { Grid, Cell } from "baseui/layout-grid";
import React from "react";
import { H1, Paragraph3 } from "baseui/typography";
import { ListItem, ListItemLabel } from "baseui/list";
import { Button } from "baseui/button";
import { CodeIcon } from "../../assets/code-icon";
import { useStyletron } from "baseui";
import { Check, Grab, CheckIndeterminate } from "baseui/icon";
import { mq } from "../../../../util/media";
import { ExerciseListProps } from "../../../../lib/types";
import { useRouter } from "next/router";

export const Exercises = ({ list }: ExerciseListProps): JSX.Element => {
  const [css, theme] = useStyletron();
  const isComplete = false;
  const router = useRouter();
  return (
    <>
      <Grid>
        <Cell span={[4, 5, 6]}>
          <H1>{list?.find((x) => x !== undefined)?.unit?.title}</H1>
        </Cell>
        <Cell span={[4, 3, 6]}>
          <Paragraph3>
            {list?.find((x) => x !== undefined)?.unit?.description}
          </Paragraph3>
        </Cell>
      </Grid>
      <ul
        className={css({
          paddingLeft: 0,
          paddingRight: 0,
          [mq(1200)]: {
            width: "86%",
            paddingLeft: "7%",
          },
        })}
      >
        {list?.map((exercise) => (
          <ListItem
            artwork={isComplete ? Check : CheckIndeterminate}
            key={exercise?.position}
            overrides={{
              Root: {
                style: {
                  ...theme.borders.border600,
                  marginBottom: theme.sizing.scale800,
                },
              },
            }}
            endEnhancer={() => (
              <Button
                onClick={() =>
                  router.push({
                    pathname: "/[unit]/[exercise]",
                    query: {
                      unit: list?.find((x) => x !== undefined)?.unit?.slug,
                      exercise: exercise?.slug,
                    },
                  })
                }
                size="compact"
                endEnhancer={() => {
                  const icon =
                    exercise?.category === "C" ? (
                      <CodeIcon
                        size={20}
                        color={theme.colors.contentInversePrimary}
                      />
                    ) : (
                      <Grab
                        size={20}
                        color={theme.colors.contentInversePrimary}
                      />
                    );
                  return icon;
                }}
              >
                {exercise?.category === "C" ? "Solve" : "Read"}
              </Button>
            )}
          >
            <ListItemLabel>{exercise?.name}</ListItemLabel>
          </ListItem>
        ))}
      </ul>
    </>
  );
};
