import { Label } from '@/components/ui/label'
import TitleText from '@/components/shared/TitleText'
import { Shield } from 'lucide-react'
import HintPageText from '@/components/shared/HintPageText'
import LegalSection, { LegalText } from '@/components/shared/LegalSection'
import { useTitle } from '@/lib/dynamicTitleHook'

const PrivacyPolicyPage = () => {
  useTitle('Ochrana osobních údajů')
  return (
    <div className='max-w-6xl mx-auto lg:px-5 py-5'>
      <div className='flex flex-col gap-6'>
        <HintPageText text='Ochrana soukromí' icon={Shield} />

        <TitleText
          underlinedText='Zásady ochrany'
          addtext2=' osobních údajů platformy'
        />

        <div className='bg-background rounded-xl shadow-lg py-4 px-5 md:px-6 space-y-6'>
          <LegalSection title='1. Úvod'>
            <LegalText>
              Think Different Academy respektuje vaše soukromí a zavazuje se
              chránit vaše osobní údaje. Tyto zásady popisují, jaké údaje
              shromažďujeme, jak je používáme a jaká máte práva v souvislosti s
              ochranou osobních údajů. Zpracování vašich údajů probíhá v souladu
              s Nařízením EU 2016/679 (GDPR) a dalšími platnými právními
              předpisy.
            </LegalText>
          </LegalSection>

          <LegalSection title='2. Správce osobních údajů'>
            <LegalText>
              Správcem vašich osobních údajů je Think Different Academy,
              nezisková organizace. V případě dotazů nás prosím kontaktujte na
              emailu: info@thinkdifferent.academy
            </LegalText>
          </LegalSection>

          <LegalSection title='3. Jaké osobní údaje shromažďujeme'>
            <div className='space-y-2 flex flex-col'>
              <LegalText>
                <span className='font-semibold text-foreground'>
                  3.1 Studijní data:
                </span>{' '}
                Odpovědi na kvízy, výsledky testů a studijní pokrok v rámci
                kurzů. Tyto údaje jsou ukládány anonymně bez vazby na konkrétní
                uživatele.
              </LegalText>
              <LegalText>
                <span className='font-semibold text-foreground'>
                  3.2 Technické údaje:
                </span>{' '}
                Základní technické informace o přístupu k platformě pro
                zajištění jejího fungování.
              </LegalText>
            </div>
          </LegalSection>

          <LegalSection title='4. Účel zpracování osobních údajů'>
            <div className='space-y-3'>
              <LegalText className='block mb-2'>
                Vaše osobní údaje používáme pro následující účely:
              </LegalText>
              <ul className='list-disc list-inside space-y-1 ml-4'>
                <LegalText className='block'>
                  <li>Poskytování vzdělávacích služeb a přístup ke kurzům</li>
                </LegalText>
                <LegalText className='block'>
                  <li>
                    Ukládání studijních výsledků a odpovědí na kvízy pro účely
                    vzdělávání
                  </li>
                </LegalText>
                <LegalText className='block'>
                  <li>Zlepšování kvality vzdělávacího obsahu a služeb</li>
                </LegalText>
                <LegalText className='block'>
                  <li>Zajištění bezpečnosti a správného fungování platformy</li>
                </LegalText>
              </ul>
            </div>
          </LegalSection>

          <LegalSection title='5. Právní základ zpracování'>
            <div className='space-y-2 flex flex-col'>
              <LegalText>
                <span className='font-semibold text-foreground'>
                  5.1 Poskytování služeb:
                </span>{' '}
                Zpracování údajů nezbytných pro poskytování vzdělávacích služeb
                a fungování platformy.
              </LegalText>
              <LegalText>
                <span className='font-semibold text-foreground'>
                  5.2 Oprávněný zájem:
                </span>{' '}
                Zlepšování kvality vzdělávacího obsahu a zajištění bezpečnosti
                platformy.
              </LegalText>
              <LegalText>
                <span className='font-semibold text-foreground'>
                  5.3 Právní povinnost:
                </span>{' '}
                Zpracování údajů požadované zákonem.
              </LegalText>
            </div>
          </LegalSection>

          <LegalSection title='6. Sdílení osobních údajů'>
            <div className='space-y-2 flex flex-col'>
              <LegalText>
                Vaše osobní údaje nesdílíme s třetími stranami, kromě
                následujících případů:
              </LegalText>
              <LegalText>
                <span className='font-semibold text-foreground'>
                  6.1 Poskytovatelé služeb:
                </span>{' '}
                Cloudové hostingové služby, analytické nástroje a další
                technické služby nezbytné pro provoz platformy. Tito
                poskytovatelé jsou smluvně zavázáni chránit vaše údaje.
              </LegalText>
              <LegalText>
                <span className='font-semibold text-foreground'>
                  6.2 Právní požadavky:
                </span>{' '}
                Pokud to vyžaduje zákon nebo soudní rozhodnutí.
              </LegalText>
              <LegalText>
                <span className='font-semibold text-foreground'>
                  6.3 Lektoři kurzů:
                </span>{' '}
                Lektoři mají přístup k údajům o studijním pokroku svých studentů
                pro účely hodnocení a zpětné vazby.
              </LegalText>
            </div>
          </LegalSection>

          <LegalSection title='7. Doba uchovávání údajů'>
            <LegalText>
              Studijní data uchováváme po dobu trvání kurzu a následně jsou
              archivována pro statistické účely v anonymizované podobě.
              Technické údaje a logy se uchovávají po dobu maximálně 12 měsíců.
              Po uplynutí doby uchovávání jsou údaje bezpečně smazány nebo
              anonymizovány.
            </LegalText>
          </LegalSection>

          <LegalSection title='8. Vaše práva'>
            <div className='space-y-2 flex flex-col'>
              <LegalText>
                V souladu s GDPR máte následující práva týkající se vašich
                osobních údajů:
              </LegalText>
              <LegalText>
                <span className='font-semibold text-foreground'>
                  8.1 Právo na přístup:
                </span>{' '}
                Můžete požádat o kopii vašich osobních údajů, které o vás
                zpracováváme.
              </LegalText>
              <LegalText>
                <span className='font-semibold text-foreground'>
                  8.2 Právo na opravu:
                </span>{' '}
                Můžete požádat o opravu nesprávných nebo neúplných údajů.
              </LegalText>
              <LegalText>
                <span className='font-semibold text-foreground'>
                  8.3 Právo na výmaz:
                </span>{' '}
                Můžete požádat o smazání vašich osobních údajů za určitých
                podmínek.
              </LegalText>
              <LegalText>
                <span className='font-semibold text-foreground'>
                  8.4 Právo na omezení zpracování:
                </span>{' '}
                Můžete požádat o omezení zpracování vašich údajů.
              </LegalText>
              <LegalText>
                <span className='font-semibold text-foreground'>
                  8.5 Právo na přenositelnost:
                </span>{' '}
                Můžete požádat o přenos vašich údajů jinému správci.
              </LegalText>
              <LegalText>
                <span className='font-semibold text-foreground'>
                  8.6 Právo vznést námitku:
                </span>{' '}
                Můžete vznést námitku proti zpracování údajů založenému na
                oprávněném zájmu.
              </LegalText>
              <LegalText>
                <span className='font-semibold text-foreground'>
                  8.7 Právo odvolat souhlas:
                </span>{' '}
                Pokud zpracování závisí na souhlasu, můžete jej kdykoli odvolat.
              </LegalText>
            </div>
          </LegalSection>

          <LegalSection title='9. Zabezpečení údajů'>
            <LegalText>
              Implementujeme vhodná technická a organizační opatření pro ochranu
              vašich osobních údajů před neoprávněným přístupem, ztrátou nebo
              zneužitím. To zahrnuje šifrování, zabezpečené servery, pravidelné
              bezpečnostní audity a omezený přístup k údajům pouze pro oprávněné
              osoby. Přestože podnikáme veškerá přiměřená opatření, nemůžeme
              garantovat absolutní bezpečnost přenosu dat přes internet.
            </LegalText>
          </LegalSection>

          <LegalSection title='10. Mezinárodní přenosy dat'>
            <LegalText>
              Vaše osobní údaje jsou primárně zpracovávány v Evropské unii.
              Pokud dochází k přenosu dat mimo EU, zajišťujeme odpovídající
              úroveň ochrany prostřednictvím standardních smluvních doložek nebo
              jiných schválených mechanismů v souladu s GDPR.
            </LegalText>
          </LegalSection>

          <LegalSection title='11. Změny zásad ochrany osobních údajů'>
            <LegalText>
              Tyto zásady můžeme čas od času aktualizovat. Doporučujeme
              pravidelně kontrolovat tyto zásady, abyste byli informováni o tom,
              jak chráníme vaše údaje.
            </LegalText>
          </LegalSection>

          <LegalSection title='12. Kontakt a podání stížnosti'>
            <LegalText>
              Máte-li jakékoli dotazy ohledně zpracování vašich osobních údajů
              nebo chcete uplatnit svá práva, kontaktujte nás na emailu:
              info@thinkdifferent.academy
            </LegalText>
            <LegalText className='mt-3'>
              Máte také právo podat stížnost u Úřadu pro ochranu osobních údajů
              (www.uoou.cz), pokud se domníváte, že zpracování vašich osobních
              údajů porušuje platné právní předpisy.
            </LegalText>
          </LegalSection>

          <section className='pt-4 border-t border-gray-200'>
            <Label variant='descriptionSmall' size='sm' className='italic'>
              Tyto zásady jsou platné od 1. listopadu 2025.
            </Label>
          </section>
        </div>
      </div>
    </div>
  )
}

export default PrivacyPolicyPage
