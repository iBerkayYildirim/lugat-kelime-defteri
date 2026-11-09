import { createId } from '../utils/words'

// İlk açılışta defter boş görünmesin diye örnek kelimeler.
// [kelime, anlam, tür, örnek cümle, seviye, doğru, yanlış, favori, kaç gün önce eklendi]
const SAMPLES = [
  ['serendipity', 'mutlu tesadüf, şans eseri yapılan güzel keşif', 'noun', 'Finding that tiny bookshop was pure serendipity.', 5, 6, 1, true, 21],
  ['resilient', 'dayanıklı, zorluklardan çabuk toparlanan', 'adjective', 'Kids are often more resilient than we think.', 4, 5, 1, false, 19],
  ['procrastinate', 'işi ertelemek, sonraya bırakmak', 'verb', 'I tend to procrastinate when a task feels too big.', 4, 4, 0, false, 18],
  ['meticulous', 'titiz, ayrıntılara çok dikkat eden', 'adjective', 'She keeps meticulous notes for every project.', 3, 4, 2, false, 15],
  ['break the ice', 'buzları eritmek, ortamı yumuşatmak', 'phrase', 'He told a silly joke to break the ice.', 3, 3, 1, true, 14],
  ['ubiquitous', 'her yerde bulunan, çok yaygın', 'adjective', 'Smartphones have become ubiquitous in daily life.', 2, 3, 2, false, 12],
  ['thrive', 'gelişmek, serpilmek, başarılı olmak', 'verb', 'These plants thrive in sunny spots.', 2, 2, 1, false, 9],
  ['reluctantly', 'isteksizce, gönülsüzce', 'adverb', 'She reluctantly agreed to stay late.', 1, 1, 2, false, 7],
  ['endeavor', 'çaba, girişim', 'noun', 'Learning a language is a lifelong endeavor.', 1, 1, 1, false, 5],
  ['figure out', 'anlamak, çözmek, akıl erdirmek', 'phrase', "I can't figure out how this machine works.", 0, 0, 0, false, 3],
  ['eloquent', 'belagatli, sözü etkili kullanan', 'adjective', 'He gave an eloquent speech at the graduation.', 0, 0, 0, false, 2],
  ['wanderlust', 'gezme tutkusu, dünyayı dolaşma isteği', 'noun', 'Her wanderlust has taken her to thirty countries.', 0, 0, 0, true, 1],
]

const DAY = 24 * 60 * 60 * 1000

export function getSampleWords() {
  const now = Date.now()
  return SAMPLES.map(([term, meaning, type, example, level, correct, wrong, favorite, daysAgo]) => ({
    id: createId(),
    term,
    meaning,
    type,
    example,
    level,
    correct,
    wrong,
    favorite,
    createdAt: now - daysAgo * DAY,
    lastReviewed: correct + wrong > 0 ? now - Math.max(1, daysAgo - 2) * DAY : null,
  }))
}
