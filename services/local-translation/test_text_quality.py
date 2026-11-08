import unittest
from text_quality import prepare_english, split_sentences, postprocess, quality_issues


class NewsTextQualityTests(unittest.TestCase):
    def test_generic_racing_terminology_and_headline_punctuation(self):
        self.assertEqual(prepare_english('Driver rues mistake that cost pole'), 'Driver regrets mistake that cost pole position.')
        self.assertEqual(prepare_english('Driver after crash in debut Qualifying'), 'Driver after a crash in first qualifying session.')

    def test_sentences_preserve_lap_times_and_abbreviations(self):
        value = 'Norris set 1:09.511. Russell was 0.093 seconds behind. Dr. Smith watched.'
        self.assertEqual(split_sentences(value), ['Norris set 1:09.511.', 'Russell was 0.093 seconds behind.', 'Dr. Smith watched.'])

    def test_canonical_names_terms_and_decimal_punctuation(self):
        output = postprocess('Russell took pole in qualifying, 0.093 seconds ahead.', '罗素在资格赛中拿到极点位置,领先0.093秒.')
        self.assertEqual(output, '拉塞尔在排位赛中拿到杆位，领先0.093秒。')
        self.assertFalse(quality_issues('Russell took pole in qualifying, 0.093 seconds ahead.', output))

    def test_untranslated_lexical_english_is_never_ready(self):
        self.assertIn('untranslated_english', quality_issues('Russell regrets mistake', '拉塞尔 Rues 错误'))
        self.assertFalse(quality_issues('F1 DRS update', 'F1 的 DRS 更新'))

    def test_missing_names_numbers_negation_and_collision_are_rejected(self):
        self.assertIn('missing_name', quality_issues('Camara after crash', '发生撞车事故'))
        self.assertIn('missing_number', quality_issues('Driver 0.093 seconds behind', '车手落后'))
        self.assertIn('missing_racing_term', quality_issues('Camara after crash', '卡马拉很失望'))
        self.assertIn('missing_negation', quality_issues('Driver will not race', '车手将参赛'))

    def test_parenthetical_names_do_not_reintroduce_english(self):
        self.assertEqual(postprocess('Lando Norris starts first.', '兰多·诺里斯(Lando Norris)先发.'), '兰多·诺里斯先发。')


if __name__ == '__main__':
    unittest.main()
