import { Label } from '@/components/ui/label'
import TitleText from '@/components/shared/TitleText'
import { FileText } from 'lucide-react'
import HintPageText from '@/components/shared/HintPageText'
import LegalSection, { LegalText } from '@/components/shared/LegalSection'
import { useTitle } from '@/lib/dynamicTitleHook'
import { useAutoTopScroll } from './CoursePage/utils/helperFunctions'

const TermsOfUsePage = () => {
  useTitle('Podmínky použití platformy')
  useAutoTopScroll()
  return (
    <div className='max-w-6xl mx-auto lg:px-5 pb-5'>
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
                  2.1 Veřejný přístup:
                </span>{' '}
                Platforma je veřejně dostupná pro všechny uživatele bez nutnosti
                registrace nebo přihlášení.
              </LegalText>
              <LegalText>
                <span className='font-semibold text-foreground'>
                  2.2 Správa platformy:
                </span>{' '}
                Platformu spravuje jeden lektor, který má přístup k
                administrátorským funkcím pro správu kurzů a obsahu.
              </LegalText>
              <LegalText>
                <span className='font-semibold text-foreground'>
                  2.3 Studenti:
                </span>{' '}
                Studenti přistupují k platformě veřejně bez omezení.
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
            </div>
          </LegalSection>

          <LegalSection title='4. Ochrana osobních údajů'>
            <LegalText>
              Zpracování vašich osobních údajů je detailně popsáno v našich
              Zásadách ochrany osobních údajů. Používáním platformy souhlasíte
              se zpracováním údajů v souladu s těmito zásadami a platnou
              legislativou (GDPR).
            </LegalText>
          </LegalSection>

          <LegalSection title='5. Omezení odpovědnosti'>
            <div className='space-y-2 flex flex-col'>
              <LegalText>
                <span className='font-semibold text-foreground'>
                  5.1 Dostupnost služeb:
                </span>{' '}
                Snažíme se zajistit nepřetržitou dostupnost platformy, ale
                nemůžeme garantovat stoprocentní dostupnost. Platforma může být
                dočasně nedostupná z důvodu údržby nebo technických problémů.
              </LegalText>
              <LegalText>
                <span className='font-semibold text-foreground'>
                  5.2 Obsah třetích stran:
                </span>{' '}
                Platforma může obsahovat odkazy na externí zdroje. Nejsme
                odpovědní za obsah těchto externích stránek.
              </LegalText>
              <LegalText>
                <span className='font-semibold text-foreground'>
                  5.3 Vzdělávací účely:
                </span>{' '}
                Obsah platformy je poskytován pouze pro vzdělávací účely a
                nenahrazuje profesionální poradenství.
              </LegalText>
            </div>
          </LegalSection>

          <LegalSection title='6. Změny podmínek'>
            <LegalText>
              Vyhrazujeme si právo tyto podmínky kdykoli upravit. Doporučujeme
              pravidelně kontrolovat tyto podmínky. Pokračováním v používání
              platformy po zveřejnění změn vyjadřujete souhlas s aktualizovanými
              podmínkami.
            </LegalText>
          </LegalSection>

          <LegalSection title='7. Ukončení přístupu'>
            <LegalText>
              Máme právo pozastavit nebo ukončit přístup k platformě v případě
              porušení těchto podmínek nebo za účelem ochrany platformy.
            </LegalText>
          </LegalSection>

          <LegalSection title='8. Kontaktní informace'>
            <LegalText>
              V případě dotazů týkajících se těchto podmínek nás prosím
              kontaktujte na e-mailu: info@thinkdifferent.academy
            </LegalText>
          </LegalSection>

          <section className='pt-4 border-t border-gray-200'>
            <Label variant='descriptionSmall' size='sm' className='italic'>
              Tyto podmínky jsou platné od 1. prosince 2025.
            </Label>
          </section>
        </div>
      </div>
    </div>
  )
}

export default TermsOfUsePage
