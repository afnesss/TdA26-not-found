import { Label } from '@/components/ui/label'
import TitleText from '@/components/shared/TitleText'
import { FileText } from 'lucide-react'
import HintPageText from '@/components/shared/HintPageText'
import LegalSection, { LegalText } from '@/components/shared/LegalSection'

const TermsOfUsePage = () => {
  return (
    <div className='max-w-6xl mx-auto px-3 md:px-5 lg:px-8 py-5'>
      <div className='flex flex-col gap-6'>
        <HintPageText text='Právní informace' icon={FileText} />

        <TitleText underlinedText='Podmínky použití' addtext2=' platformy' />

        <div className='bg-background rounded-xl shadow-lg py-4 px-5 md:px-6 space-y-6'>
          <LegalSection title='1. Úvodní ustanovení'>
            <LegalText>
              Vítejte na platformě Think Different Academy. Používáním našich
              služeb souhlasíte s těmito podmínkami použití. Prosím, přečtěte si
              je pozorně před použitím platformy. Tyto podmínky upravují vztah
              mezi vámi a Think Different Academy, neziskovou organizací
              zaměřenou na rozvoj kritického a kreativního myšlení.
            </LegalText>
          </LegalSection>

          <LegalSection title='2. Přístup k platformě'>
            <div className='space-y-2 flex-col flex'>
              <LegalText>
                <span className='font-semibold text-foreground'>
                  2.1 Registrace:
                </span>{' '}
                Pro přístup k některým funkcím platformy je nutná registrace.
                Zavazujete se poskytovat pravdivé a aktuální informace.
              </LegalText>
              <LegalText>
                <span className='font-semibold text-foreground'>
                  2.2 Bezpečnost účtu:
                </span>{' '}
                Jste odpovědní za zachování důvěrnosti přihlašovacích údajů a za
                všechny aktivity prováděné pod vaším účtem.
              </LegalText>
              <LegalText>
                <span className='font-semibold text-foreground'>
                  2.3 Oprávnění:
                </span>{' '}
                Platforma nabízí různé role (student, lektor, administrátor).
                Každá role má specifická oprávnění a odpovědnosti.
              </LegalText>
            </div>
          </LegalSection>

          <LegalSection title='3. Použití vzdělávacího obsahu'>
            <div className='space-y-2 flex flex-col'>
              <LegalText>
                <span className='font-semibold text-foreground'>
                  3.1 Licence k použití:
                </span>{' '}
                Veškerý vzdělávací obsah (kurzy, materiály, kvízy) je poskytován
                pouze pro osobní, nekomerční vzdělávací účely.
              </LegalText>
              <LegalText>
                <span className='font-semibold text-foreground'>
                  3.2 Autorská práva:
                </span>{' '}
                Obsah platformy je chráněn autorskými právy. Kopírování,
                distribuce nebo komerční využití bez výslovného souhlasu je
                zakázáno.
              </LegalText>
              <LegalText>
                <span className='font-semibold text-foreground'>
                  3.3 Uživatelský obsah:
                </span>{' '}
                Nahráním vlastního obsahu (diskusní příspěvky, odpovědi)
                udělujete platformě právo tento obsah používat pro vzdělávací
                účely.
              </LegalText>
            </div>
          </LegalSection>

          <LegalSection title='4. Pravidla chování'>
            <div className='space-y-3'>
              <LegalText>Při používání platformy se zavazujete:</LegalText>
              <ul className='list-disc list-inside space-y-2 ml-4'>
                <LegalText className='block'>
                  <li>
                    Respektovat ostatní uživatele a udržovat konstruktivní
                    atmosféru
                  </li>
                </LegalText>
                <LegalText className='block'>
                  <li>
                    Nezveřejňovat obsah, který je urážlivý, nezákonný nebo
                    porušuje práva třetích stran
                  </li>
                </LegalText>
                <LegalText className='block'>
                  <li>
                    Nepokoušet se o neoprávněný přístup k systému nebo datům
                    jiných uživatelů
                  </li>
                </LegalText>
                <LegalText className='block'>
                  <li>Nešířit spam, reklamy nebo jiný nevyžádaný obsah</li>
                </LegalText>
              </ul>
            </div>
          </LegalSection>

          <LegalSection title='5. Ochrana osobních údajů'>
            <LegalText>
              Zpracování vašich osobních údajů je detailně popsáno v našich
              Zásadách ochrany osobních údajů. Používáním platformy souhlasíte
              se zpracováním údajů v souladu s těmito zásadami a platnou
              legislativou (GDPR).
            </LegalText>
          </LegalSection>

          <LegalSection title='6. Omezení odpovědnosti'>
            <div className='space-y-2 flex flex-col'>
              <LegalText>
                <span className='font-semibold text-foreground'>
                  6.1 Dostupnost služeb:
                </span>{' '}
                Snažíme se zajistit nepřetržitou dostupnost platformy, ale
                nemůžeme garantovat stoprocentní dostupnost. Platforma může být
                dočasně nedostupná z důvodu údržby nebo technických problémů.
              </LegalText>
              <LegalText>
                <span className='font-semibold text-foreground'>
                  6.2 Obsah třetích stran:
                </span>{' '}
                Platforma může obsahovat odkazy na externí zdroje. Nejsme
                odpovědní za obsah těchto externích stránek.
              </LegalText>
              <LegalText>
                <span className='font-semibold text-foreground'>
                  6.3 Vzdělávací účely:
                </span>{' '}
                Obsah platformy je poskytován pouze pro vzdělávací účely a
                nenahrazuje profesionální poradenství.
              </LegalText>
            </div>
          </LegalSection>

          <LegalSection title='7. Změny podmínek'>
            <LegalText>
              Vyhrazujeme si právo tyto podmínky kdykoliv upravit. O podstatných
              změnách vás budeme informovat prostřednictvím platformy nebo
              e-mailem. Pokračováním v používání platformy po zveřejnění změn
              vyjadřujete souhlas s aktualizovanými podmínkami.
            </LegalText>
          </LegalSection>

          <LegalSection title='8. Ukončení přístupu'>
            <LegalText>
              Máme právo pozastavit nebo ukončit váš přístup k platformě v
              případě porušení těchto podmínek nebo za účelem ochrany platformy
              a jejích uživatelů. Váš účet můžete kdykoli sami zrušit
              kontaktováním naší podpory.
            </LegalText>
          </LegalSection>

          <LegalSection title='9. Rozhodné právo'>
            <LegalText>
              Tyto podmínky se řídí právním řádem České republiky. Případné
              spory budou řešeny u příslušných soudů České republiky.
            </LegalText>
          </LegalSection>

          <LegalSection title='10. Kontaktní informace'>
            <div className='space-y-3'>
              <LegalText>
                V případě dotazů týkajících se těchto podmínek nás prosím
                kontaktujte:
              </LegalText>
              <div className='bg-accent-teal/10 rounded-lg p-4 space-y-2 mt-2'>
                <LegalText className='font-semibold block'>
                  Think Different Academy
                </LegalText>
                <LegalText className='block'>
                  Email: info@thinkdifferent.academy
                </LegalText>
              </div>
            </div>
          </LegalSection>

          <section className='pt-4 border-t border-gray-200'>
            <Label variant='descriptionSmall' size='sm' className='italic'>
              Tyto podmínky jsou platné od 1. listopadu 2025.
            </Label>
          </section>
        </div>
      </div>
    </div>
  )
}

export default TermsOfUsePage
