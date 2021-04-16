import { NormalizedCacheObject } from "@apollo/client/cache/inmemory/types";
import {
  GetStaticPaths,
  GetStaticPathsResult,
  GetStaticProps,
  GetStaticPropsResult,
  NextPage,
} from "next";
import { ParsedUrlQuery } from "querystring";
import React from "react";
import Layout from "../../../lib/components/Layout";
import {
  addApolloState,
  initializeApollo,
} from "../../../lib/graphql/apolloClient";
import { EXERCISE_PATHS, GET_EXERCISE } from "../../../lib/graphql/queries";
import { exerciseWithUnitPaths_exerciseList as PathProps } from "../../../lib/graphql/queries/Exercise/__generated__/exerciseWithUnitPaths";
import { ExerciseMain } from "../../../sections/Exercise/components/ExerciseMain";

const ExercisePage: NextPage = (): JSX.Element => (
  <Layout>
    <ExerciseMain />
  </Layout>
);

export const getStaticPaths: GetStaticPaths = async (): Promise<
  GetStaticPathsResult<ParsedUrlQuery>
> => {
  // get all the paths for exercises from a GraphQL at build time
  const apolloClient = initializeApollo();
  const { data } = await apolloClient.query({
    query: EXERCISE_PATHS,
  });
  const paths = data.exerciseList.map((item: PathProps) => ({
    params: { unit: item.unit?.slug, exercise: item.slug },
  }));
  // fallback:false  All paths will be known at build time. If not exist, return 404.
  // Change to `fallback:true` if you need to enable statically generating additional exercises during runtime
  // And add to ExercisePage
  //                if (router.isFallback) {
  //                return <div>Loading...</div>
  //              }
  //   If fallback:true and the page is not yet generated, this will be displayed
  // initially until getStaticProps() finishes running
  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps = async ({
  params,
}): Promise<GetStaticPropsResult<NormalizedCacheObject>> => {
  const apolloClient = initializeApollo();

  // Static generation (SSG)
  const exercise = await apolloClient.query({
    query: GET_EXERCISE,
    variables: {
      slug: params?.exercise,
    },
  });

  return addApolloState(apolloClient, {
    // Pass exercise data to the page via props
    props: { exercise },
    // `revalidate` re-generate the exercise (value in seconds) in the background
    // if a request comes in (if the page isn’t being visited by users, revalidation will be paused)
    // and updates the static page for *future* requests.
    //  revalidate: 60,
  });
};

export default ExercisePage;