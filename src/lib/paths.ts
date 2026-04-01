import { getCollection } from 'astro:content';

export async function getSubtopicPaths() {
  const topics = await getCollection('topics');
  const subtopicsCollection = await getCollection('subtopics');

  const paths = [];
  for (const topic of topics) {
    const topicSubtopics = subtopicsCollection.filter((s) => s.data.topicId === topic.data.id);
    for (const subtopic of topicSubtopics) {
      paths.push({
        params: { topic: topic.data.id, subtopic: subtopic.data.id },
        props: { topic: topic.data, subtopic: subtopic.data },
      });
    }
  }
  return paths;
}
