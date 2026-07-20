import { getCollection, type CollectionEntry } from 'astro:content';

type Topic = CollectionEntry<'topics'>['data'];
type Subtopic = CollectionEntry<'subtopics'>['data'];

/**
 * Společná dvojitá smyčka topic × subtopic pro getStaticPaths. `extra` může
 * dopočítat další props (např. položky navázané kolekce filtrované na dané
 * téma/podkapitolu) — viz pokusy.astro/materialy.astro/aktivity.astro/ukoly.astro.
 */
export async function getSubtopicPaths<T extends Record<string, unknown> = Record<string, never>>(
  extra?: (topic: Topic, subtopic: Subtopic) => T | Promise<T>,
) {
  const topics = await getCollection('topics');
  const subtopicsCollection = await getCollection('subtopics');

  const paths = [];
  for (const topic of topics) {
    const topicSubtopics = subtopicsCollection.filter((s) => s.data.topicId === topic.data.id);
    for (const subtopic of topicSubtopics) {
      const extraProps = extra ? await extra(topic.data, subtopic.data) : ({} as T);
      paths.push({
        params: { topic: topic.data.id, subtopic: subtopic.data.id },
        props: { topic: topic.data, subtopic: subtopic.data, ...extraProps },
      });
    }
  }
  return paths;
}
